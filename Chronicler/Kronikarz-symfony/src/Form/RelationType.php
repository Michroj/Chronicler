<?php

namespace App\Form;

use App\Entity\Relation;
use App\Entity\User;
use Doctrine\Common\Collections\Selectable;
use Doctrine\ORM\EntityRepository;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class RelationType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('parent', EntityType::class, [
                'class' => User::class,
                'label' => 'relation.parent',
                'choice_label' => function (User $user) {
                    return $user->getFirstName() . " " . $user->getLastName();
                },
                'choice_value' => 'id',
                'multiple' => false,
                'query_builder' => function (EntityRepository $er) use ($options) {
                    $queryBuilder = $er->createQueryBuilder('u');
                    return $queryBuilder
                        ->where(
                            'u.auth_id = :loggedId'
                        )
                        ->setParameter('loggedId', $options['loggedId'] ?? 0);
                },
            ])
            ->add('child', EntityType::class, [
                'class' => User::class,
                'label' => 'relation.child',
                'choice_label' => function (User $user) {
                    return $user->getFirstName() . " " . $user->getLastName();
                },
                'choice_value' => 'id',
                'multiple' => false,
                'query_builder' => function (EntityRepository $er) use ($options) {
                    $queryBuilder = $er->createQueryBuilder('u');
                    return $queryBuilder
                        ->where(
                            'u.auth_id = :loggedId'
                        )
                        ->setParameter('loggedId', $options['loggedId'] ?? 0);
                },
            ])
            ->add('relationship_type', ChoiceType::class, [
                'label' => 'relation.relationship_type',
                'choices' => [
                    'Małżeństwo' => 0,
                    'Dziecko' => 1,
                ],
            ])
            ->add('wedding_date', DateType::class, [
                'label' => 'relation.wedding_date',
                'widget' => 'single_text',
                'required' => false,
            ])
            ->add('Submit', SubmitType::class, [
                'label' => 'submit'
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Relation::class,
            'csrf_protection' => true,
            'csrf_field_name' => '_token',
            'csrf_token_id' => 'user_item',
            'loggedId' => 0
        ]);
    }
}
