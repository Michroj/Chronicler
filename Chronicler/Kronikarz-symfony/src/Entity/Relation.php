<?php

namespace App\Entity;

use App\Repository\RelationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: RelationRepository::class)]
class Relation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: "id")]
    private User|null $parent = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: "id")]
    private User|null $child = null;

    #[ORM\Column]
    private ?int $relationship_type = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $wedding_date = null;

    public function getId(): ?int
    {
        return $this->id;
    }
    public function getChild(): ?User
    {
        return $this->child;
    }

    public function setChild(User $child): self
    {
        $this->child = $child;

        return $this;
    }
    public function getParent(): ?User
    {
        return $this->parent;
    }

    public function setParent(User $parent): self
    {
        $this->parent = $parent;

        return $this;
    }


    public function getRelationshipType(): ?int
    {
        return $this->relationship_type;
    }

    public function setRelationshipType(int $relationship_type): self
    {
        $this->relationship_type = $relationship_type;

        return $this;
    }

    public function getWeddingDate(): ?\DateTimeInterface
    {
        return $this->wedding_date;
    }

    public function setWeddingDate(?\DateTimeInterface $wedding_date): self
    {
        $this->wedding_date = $wedding_date;

        return $this;
    }
}
