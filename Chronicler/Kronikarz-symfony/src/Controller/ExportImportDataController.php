<?php

namespace App\Controller;

use App\Entity\Relation;
use App\Entity\User;
use Doctrine\Persistence\ManagerRegistry;
use JMS\Serializer\SerializerInterface;
use stdClass;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints\DateTime;

class ExportImportDataController extends AbstractController
{
    public function __construct(
        private readonly ManagerRegistry     $registry,
        private readonly SerializerInterface $serializer
    )
    {
    }


    #[Route('/show-all-data')]
    public function show_all_relations(Request $request, UserInterface $loggedUser): Response
    {
        $em = $this->registry->getManager();

        // users
        // --------------------------------------------------------------------------------
        $users = $em->getRepository(User::class)->createQueryBuilder('u')
            ->select('u')
            ->where('u.auth_id = :loggedId')
            ->setParameter('loggedId', $loggedUser->getId())
            ->getQuery()
            ->getResult();

        // relations
        // --------------------------------------------------------------------------------
        $queryBuilder = $em->getRepository(Relation::class)->createQueryBuilder('r');

        $entities = $queryBuilder
            ->select('r')
            ->where(
                $queryBuilder->expr()->in(
                    "r.parent",
                    $em->getRepository(User::class)->createQueryBuilder('u')
                        ->select('u.id')
                        ->where('u.auth_id = :loggedId')
                        ->getDQL()
                )
            )
            ->setParameter('loggedId', $loggedUser->getId())
            ->getQuery()
            ->getResult();

        $relations = [];
        foreach ($entities as $entity) {
            $relations[] = [
                'id' => $entity->getId(),
                'parent_id' => $entity->getParent()->getId(),
                'child_id' => $entity->getChild()->getId(),
                'relationship_type' => $entity->getRelationshipType(),
                'wedding_date' => $entity->getWeddingDate(),
            ];
        }

        // return merge arrays
        // --------------------------------------------------------------------------------
        $data = [...$users, ...$relations];
        $reports = $this->serializer->serialize($data, 'json');

        return new Response($reports);
    }

    #[Route('/upload-all-data')]
    public function upload_all_relations(Request $request, UserInterface $loggedUser): Response
    {
        $em = $this->registry->getManager();
        $data = $request->getContent();

        $data = json_decode($data);

        $users = [];
        $relations = [];
        foreach ($data as $row) {
            if (isset($row->first_name)) {
                $users[] = $row;
            } elseif (isset($row->parent_id)) {
                $relations[] = $row;
            }
        }

        // users
        // --------------------------------------------------------------------------------
        foreach ($users as $user) {
            $entity = $em->getRepository(User::class)->findOneBy(['id' => $user->id]);
            if (is_null($entity)) {
                $entity = new User();
                $oldId = $user->id;
            }

            $entity->setFirstName($user->first_name);
            $entity->setLastName($user->last_name);
            $entity->setBirthday(new \DateTime($user->birthday));
            $entity->setDeath(isset($user->death) ? new \DateTime($user->death) : null);
            $entity->setBirthplace($user->birthplace);
            $entity->setCountryOfBirth($user->country_of_birth);
            $entity->setSex($user->sex ?? 0);
            $entity->setProfession($user->profession ?? null);
            $entity->setAdditionalInformation($user->additional_information ?? null);
            $entity->setAuthId($user->auth_id ?? 0);
            $entity->setPositionX($user->position__x ?? null);
            $entity->setPositionY($user->position__y ?? null);
            $entity->setAvatar($user->avatar ?? null);

            $em->persist($entity);
            $em->flush();

            // if there are no such users in the database, and there are related relations in .json
            if (isset($oldId)) {
                foreach ($relations as $relation) {
                    if (isset($relation->parent_id) && $relation->parent_id == $oldId) {
                        $relation->parent_id = $entity->getId();
                    } elseif (isset($relation->child_id) && $relation->child_id == $oldId) {
                        $relation->child_id = $entity->getId();
                    }
                }
            }

        }

        // relations
        // --------------------------------------------------------------------------------
        foreach ($relations as $relation) {
            $entity = $em->getRepository(Relation::class)->findOneBy(['id' => $relation->id]);
            if (is_null($entity)) {
                $entity = new Relation();
            }
            $parent = $em->getRepository(User::class)->findOneBy(['id' => $relation->parent_id]);
            $child = $em->getRepository(User::class)->findOneBy(['id' => $relation->child_id]);

            $entity->setParent($parent);
            $entity->setChild($child);
            $entity->setRelationshipType($relation->relationship_type ?? 0);
            $entity->setWeddingDate($relation->wedding_date ?? null);

            $em->persist($entity);
            $em->flush();
        }

        return new Response('', Response::HTTP_OK);
    }
}
