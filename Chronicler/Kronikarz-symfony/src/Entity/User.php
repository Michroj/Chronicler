<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Attribute;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[Attribute(Attribute::IS_REPEATABLE | Attribute::TARGET_CLASS)]
class User
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
//    #[ORM\OneToMany(mappedBy: "parent", targetEntity: Relation::class)]
//    #[ORM\OneToMany(mappedBy: "child", targetEntity: Relation::class)]
//    #[ORM\ManyToMany(targetEntity: Relation::class, inversedBy: "child")]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    private ?string $firstName = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    private ?string $lastName = null;
    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Assert\NotBlank]
    private ?\DateTimeInterface $birthday = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $death = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    private ?string $birthplace = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    private ?string $country_of_birth = null;

    #[ORM\Column(length: 255)]
    private ?string $sex = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $profession = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $additional_information = null;

    #[ORM\Column]
    private ?int $auth_id = null;

    #[ORM\Column]
    private ?int $position_X = null;

    #[ORM\Column]
    private ?int $position_Y = null;

    #[ORM\Column]
    private ?string $avatar = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): self
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): self
    {
        $this->lastName = $lastName;

        return $this;
    }

    public function getBirthday(): ?\DateTimeInterface
    {
        return $this->birthday;
    }

    public function setBirthday(\DateTimeInterface $birthday): self
    {
        $this->birthday = $birthday;

        return $this;
    }

    public function getDeath(): ?\DateTimeInterface
    {
        return $this->death;
    }

    public function setDeath(?\DateTimeInterface $death): self
    {
        $this->death = $death;

        return $this;
    }

    public function getBirthplace(): ?string
    {
        return $this->birthplace;
    }

    public function setBirthplace(string $birthplace): self
    {
        $this->birthplace = $birthplace;

        return $this;
    }

    public function getCountryOfBirth(): ?string
    {
        return $this->country_of_birth;
    }

    public function setCountryOfBirth(?string $country_of_birth): self
    {
        $this->country_of_birth = $country_of_birth;

        return $this;
    }

    public function getSex(): ?string
    {
        return $this->sex;
    }

    public function setSex(string $sex): self
    {
        $this->sex = $sex;

        return $this;
    }

    public function getProfession(): ?string
    {
        return $this->profession;
    }

    public function setProfession(?string $profession): self
    {
        $this->profession = $profession;

        return $this;
    }

    public function getAdditionalInformation(): ?string
    {
        return $this->additional_information;
    }

    public function setAdditionalInformation(?string $additional_information): self
    {
        $this->additional_information = $additional_information;

        return $this;
    }

    public function getAuthId(): ?int
    {
        return $this->auth_id;
    }

    public function setAuthId(?int $auth_id): self
    {
        $this->auth_id = $auth_id;

        return $this;
    }

    public function getPositionX(): ?int
    {
        return $this->position_X;
    }

    public function setPositionX(?int $position_X): self
    {
        $this->position_X = $position_X;

        return $this;
    }

    public function getPositionY(): ?int
    {
        return $this->position_Y;
    }

    public function setPositionY(?int $position_Y): self
    {
        $this->position_Y = $position_Y;

        return $this;
    }

    public function getAvatar(): ?string
    {
        return $this->avatar;
    }

    public function setAvatar(?string $avatar): self
    {
        $this->avatar = $avatar;

        return $this;
    }
}
