<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20230117234617 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE relation (
            id INT AUTO_INCREMENT NOT NULL, 
            parent_id INT NOT NULL, child_id INT NOT NULL, 
            relationship_type INT NOT NULL, 
            wedding_date DATE DEFAULT NULL,
            PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
    ');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE relation');
    }
}
