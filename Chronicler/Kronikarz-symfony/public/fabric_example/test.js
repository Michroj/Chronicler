export class Person {
  constructor(
    id,
    first_name,
    last_name,
    birthday,
    death,
    dateOfMarriage,
    birthplace,
    country_of_birth,
    sex,
    profession,
    additional_information,
    spouse,
    childs,
    position_x,
    position_y,
    avatar
  ) {
    this.id = id;
    this.first_name = first_name;
    this.last_name = last_name;
    this.birthday = birthday;
    this.death = death;
    this.dateOfMarriage = dateOfMarriage;
    this.birthplace = birthplace;
    this.country_of_birth = country_of_birth;
    this.age = Math.floor(
      (Date.parse(death) - Date.parse(birthday)) / 31536000000,
      0
    ); // Amount of miliseconds in year
    this.sex = sex;
    this.profession = profession;
    this.additional_information = additional_information;
    this.spouse = spouse;
    this.childs = childs;
    this.position_x = position_x;
    this.position_y = position_y;
    this.avatar = avatar;
  }
}

export const persons = [
  new Person(
    "Antoni",
    "Zuber",
    new Date("September 17, 2001"),
    new Date(Date.now()),
    new Date("June 1, 2022"),
    "Bielsko-Biała",
    "Polska",
    "M",
    "Student",
    "Kocham Ruch",
    "Natalia_Staniek",
    ["Cristiano_Zuber", "Wilhelm_Zuber"]
  ),
  new Person(
    "Rafał",
    "Ochorok",
    new Date("June 5, 2000"),
    new Date(Date.now()),
    new Date(Date.now()),
    "Katowice",
    "Polska",
    "M",
    "COiG",
    ""
  ),
  new Person(
    "Tomasz",
    "Barnaś",
    new Date("July 31, 1999"),
    new Date(Date.now()),
    new Date(Date.now()),
    "Siemianowice Śląskie",
    "Polska",
    "M",
    "TVP",
    "Tiktok: Tomasz_Barnas"
  ),
  new Person(
    "Michał",
    "Rojczyk",
    new Date("February 6, 2001"),
    new Date("February 6, 2010"),
    new Date(Date.now()),
    "Bielsko-Biała",
    "Polska",
    "M",
    "Student",
    "Kozak Valo"
  ),
  new Person(
    "Natalia",
    "Staniek",
    new Date("December 17, 2002"),
    new Date(Date.now()),
    new Date("June 1, 2022"),
    "Bielsko-Biała",
    "Polska",
    "K",
    "Student",
    "Kocham Antka",
    "Antoni_Zuber",
    ["Cristiano_Zuber"]
  ),
  new Person(
    "Cristiano",
    "Zuber",
    new Date("January 17, 2023"),
    new Date(Date.now()),
    new Date(Date.now()),
    "Bielsko-Biała",
    "Polska",
    "M",
    "Student",
    "Kocham Ruch",
    "",
    []
  ),
  new Person(
    "Wilhelm",
    "Zuber",
    new Date("January 17, 2023"),
    new Date(Date.now()),
    new Date(Date.now()),
    "Bielsko-Biała",
    "Polska",
    "M",
    "Student",
    "Kocham Ruch",
    "Natalia_Staniek",
    ["Cristiano_Zuber", "Wilhelm_Zuber"]
  ),
];
