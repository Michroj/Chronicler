<?php

namespace App\Form;

use App\Entity\User;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\File;

class UserType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('firstName', null, [
                'label' => 'user.firstName'
            ])
            ->add('lastName', null, [
                'label' => 'user.lastName'
            ])
            ->add('birthday', DateType::class, [
                'widget' => 'single_text',
                'label' => 'user.birthday'
            ])
            ->add('death', DateType::class, [
                'widget' => 'single_text',
                'required' => false,
                'label' => 'user.death'
            ])
            ->add('birthplace', null, [
                'label' => 'user.birthplace'
            ])
            ->add('country_of_birth', null, [
                'label' => 'user.country_of_birth'
            ])
            ->add('sex', ChoiceType::class, [
                'choices' => [
                    'Mężczyzna' => 0,
                    'Kobieta' => 1
                ],
                'label' => 'user.sex'
            ])
            ->add('profession', null, [
                'label' => 'user.profession'
            ])
            ->add('additional_information', null, [
                'label' => 'user.additional_information'
            ])
            ->add('avatar', FileType::class, [
                'label' => 'user.avatar',
                'mapped' => false,
                'required' => false,
                'attr'   =>  [
                    'class'   => 'form-control form-control-sm'
                ],
                'constraints' => [
                    new File([
                        'maxSize' => '1024k',
                        'mimeTypes' => [
                            'image/png',
                            'image/jpeg',
                            'image/svg+xml',
                        ],
                        'mimeTypesMessage' => 'Please upload a valid image',
                    ])
            ]])
            ->add('Submit', SubmitType::class, [
                'label' => 'submit'
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
            'csrf_protection' => true,
            'csrf_field_name' => '_token',
            'csrf_token_id' => 'user_item'
        ]);
    }
}
