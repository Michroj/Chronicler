<?php

namespace App\Controller;

use App\Entity\Relation;
use App\Entity\User;
use App\Form\RelationType;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\EntityManagerInterface;
use JMS\Serializer\SerializerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;
use Twig\Environment;

class RelationController extends AbstractController
{
    public function __construct(
        private readonly ManagerRegistry     $registry,
        private readonly SerializerInterface $serializer
    )
    {
    }

    #[Route('/new-relation')]
    public function new(Environment $twig, Request $request, EntityManagerInterface $entityManager, UserInterface $loggedUser): Response
    {
        $relation = new Relation();

        $form = $this->createForm(RelationType::class, $relation, ['loggedId' => $loggedUser->getId()]);

        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            if (
                $form->isValid()
                && $relation->getParent() !== $relation->getChild()
            ) {
                $entityManager->persist($relation);
                $entityManager->flush();

                return new Response('Relation created');
            } else {
                return new Response('Nie można utworzyć relacji.', Response::HTTP_BAD_REQUEST);
            }
        }

        return new Response($twig->render('relation/index.html.twig', [
            'title' => 'Nowa relacja',
            'relation_form' => $form->createView()
        ]));
    }

    #[Route('/edit-relation/{id}/', 'edit-relation', ['id' => '\d+'])] // todo: secure the @ParamConverter
    public function edit(Request $request, Relation $relation, UserInterface $loggedUser): Response
    {
        $response = new Response('', Response::HTTP_OK);

        $em = $this->registry->getManager();
        $form = $this->createForm(RelationType::class, $relation, ['loggedId' => $loggedUser->getId()]);

        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            if ($form->isValid()
                && $relation->getParent() !== $relation->getChild()
            ) {
                $em->persist($relation);
                $em->flush();
                return new JsonResponse([
                    'content' => 'Zaktualizowano dane relacji.'
                ]);
            } else {
                return new Response('Nie można wyedytować relacji.', Response::HTTP_BAD_REQUEST);
            }
        }

        return $this->render('relation/index.html.twig', [
            'title' => 'Edycja relacji',
            'relation_form' => $form->createView()
        ], $response);
    }

    #[Route('/delete-relation/{id}', 'delete-relation', ['id' => '\d+'])]
    public function delete(int $id): Response
    {
        if (!is_numeric($id)) {
            return new Response('', Response::HTTP_BAD_REQUEST);
        }
        $em = $this->registry->getManager();
        $entity = $em->getRepository(Relation::class)->findOneBy(['id' => $id]);
        if (!is_null($entity)) {
            $em->remove($entity);
            $em->flush();

            return new Response('', Response::HTTP_OK);
        } else {
            return new Response('', Response::HTTP_BAD_REQUEST);
        }

    }

    #[Route('/show-relation/{id}', 'show-relation', ['id' => '\d+'])]
    public function show(Request $request, Relation $relation): Response
    {
        $form = $this->createForm(RelationType::class, $relation);

        $reports = $this->serializer->serialize($form->getNormData(), 'json');

        return new Response($reports);
    }

    #[Route('/show-all-relations')]
    public function show_all_relations(Request $request, UserInterface $loggedUser): Response
    {
        $em = $this->registry->getManager();

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

        $reports = $this->serializer->serialize($entities, 'json');

        return new Response($reports);
    }
}
