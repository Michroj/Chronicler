<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;
use JMS\Serializer\SerializerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\User;
use App\Form\UserType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\User\UserInterface;
use Twig\Environment;
use App\Service\FileUploader;

class UserController extends AbstractController
{
    public function __construct(
        private readonly ManagerRegistry     $registry,
        private readonly SerializerInterface $serializer
    )
    {
    }

    #[Route('/new-user')]
    public function new(
        Environment            $twig, Request $request,
        EntityManagerInterface $entityManager, SerializerInterface $serializer,
        UserInterface          $loggedUser, FileUploader $fileUploader
    ): Response
    {
        $user = new User();

        $form = $this->createForm(UserType::class, $user);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            /** @var UploadedFile $avatar */
            $avatarFile = $form->get('avatar')->getData();
            if ($avatarFile) {
                $avatarFileName = $fileUploader->upload($avatarFile);
                $user->setAvatar($avatarFileName);
            }
            $user->setAuthId($loggedUser->getId());

            $entityManager->persist($user);
            $entityManager->flush();

            return new JsonResponse([
                'user_id' => $user->getId(),
                'content' => 'User created.'
            ], Response::HTTP_OK);
        }

        return new Response($twig->render('user/show.html.twig', [
            'title' => 'Nowy użytkownik',
            'user_form' => $form->createView()
        ]));
    }

    #[Route('/show-user/{id}', 'show-user', ['id' => '\d+'])]
    public function show(Request $request, User $user): Response
    {
        $form = $this->createForm(UserType::class, $user);

        $reports = $this->serializer->serialize($form->getNormData(), 'json');

        return new Response($reports);
    }

    #[Route('/show-all-users')]
    public function show_all_user(Request $request, UserInterface $loggedUser): Response
    {
        $em = $this->registry->getManager();

        $entities = $em->getRepository(User::class)->createQueryBuilder('u')
            ->select('u')
            ->where('u.auth_id = :loggedId')
            ->setParameter('loggedId', $loggedUser->getId())
            ->getQuery()
            ->getResult();

        $reports = $this->serializer->serialize($entities, 'json');

        return new Response($reports);
    }

    #[Route('/edit-user/{id}/', 'edit-user', ['id' => '\d+'])] // todo: secure the @ParamConverter
    public function edit(Request $request, User $user, FileUploader $fileUploader): Response
    {
        $response = new Response('', Response::HTTP_OK);

        $em = $this->registry->getManager();
        $form = $this->createForm(UserType::class, $user);

        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            /** @var UploadedFile $avatar */
            $avatarFile = $form->get('avatar')->getData();
            if ($avatarFile) {
                $avatarFileName = $fileUploader->upload($avatarFile);
                $user->setAvatar($avatarFileName);
//                if ($user->getAvatar() !== null) { // todo: clone user's profile when try to remove old photo
//                    $fileUploader->remove($user->getAvatar());
//                };
            }

            if ($form->isValid()) {
                $em->persist($user);
                $em->flush();
                return new JsonResponse([
                    'content' => 'Zaktualizowano dane użytkownika.'
                ]);
            } else {
                $response = new Response('', Response::HTTP_BAD_REQUEST);
            }
        }

        return $this->render('user/show.html.twig', [
            'title' => 'Edycja użytkownika',
            'user_form' => $form->createView()
        ], $response);
    }

    #[Route('/delete-user/{id}', 'delete-user', ['id' => '\d+'])]
    public function delete(int $id, FileUploader $fileUploader): Response
    {
        $em = $this->registry->getManager();
        $entity = $em->getRepository(User::class)->findOneBy(['id' => $id]);
        if (!is_null($entity)) {
            if ($entity->getAvatar() !== null) {
                $fileUploader->remove($entity->getAvatar());
            };

            $em->remove($entity);
            $em->flush();

            return new Response('', Response::HTTP_OK);
        } else {
            return new Response('', Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/set-position/{id}-{position_X}-{position_Y}')]
    public function setPosition(int $id, int $position_X, int $position_Y): Response
    {
        $em = $this->registry->getManager();
        $entity = $em->getRepository(User::class)->findOneBy(['id' => $id]);

        if (!is_null($entity)) {
            $entity->setPositionX($position_X);
            $entity->setPositionY($position_Y);

            $em->persist($entity);
            $em->flush();

            return new Response('', Response::HTTP_OK);
        } else {
            return new Response('', Response::HTTP_BAD_REQUEST);
        }
    }

}