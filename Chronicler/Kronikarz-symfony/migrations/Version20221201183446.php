<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20221201183446 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('
            CREATE TABLE `user` 
            (id INT AUTO_INCREMENT NOT NULL, first_name VARCHAR(255) NOT NULL, 
            last_name VARCHAR(255) NOT NULL, birthday DATE NOT NULL, death DATE DEFAULT NULL, 
            birthplace VARCHAR(255) NOT NULL, country_of_birth VARCHAR(255) NOT NULL, 
            sex VARCHAR(255) NOT NULL, profession VARCHAR(255) DEFAULT NULL, 
            additional_information VARCHAR(255) DEFAULT NULL, 
            auth_id INT DEFAULT NULL, 
            position_X INT DEFAULT NULL, 
            position_Y INT DEFAULT NULL, 
            avatar VARCHAR(255) DEFAULT NULL, 
            PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
                ');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE `user`');
    }
}
