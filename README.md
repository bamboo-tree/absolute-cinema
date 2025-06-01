# Absolute Cinema _for movie lovers and haters_

## Overwiew
Absolute Cinema is a simple online service that allows users to submit reviews for various movies. This project was completed as a final project for the subject of _Web Application Frameworks_.

- Wyszczególnione są 3 role ADMIN, USER, GUEST pozwalające na wporwadzenie odpowiednich zabezpieczeń oraz izolacji endpointów. Weryfikacja odbywa się zarówno po stronie klienta jak i serwera.
- Użytkownicy pod tymi samymi adresami mają wyświetlane właściwe dla siebie treści
- Autoryzacja dostępu do API na podstawie tokenu JWT
- Strona klienta jest towrzona z komponentów react
- Formularze posiadają walidację danych po stronie klienta i serwera


Funkcjonalności:

GUEST:
- Przeglądanie filmów i recenzji
- Możliwość wyszukiwania filmu po tytule
- Możliwość założenia konta użytkownika

USER:
- Przeglądanie filmów i recenzji
- Możliwość wyszukiwania filmu po tytule
- Dodawanie własnych recenzji z możliwością edycji i usunięcia
- Zarządzanie profilem: zmiana danych osobowych lub hasła

ADMIN:
- Nie posiada możliwości przeglądania filmów tak jak GUEST i USER
- Dostęp do panelu administratora
- Zarządzanie użytkownikami, możliwość usunięcia
- Zarządzanie filmami, możliwość usunięcia i edycji danych o filmie
- Dodawanie nowych filmów do serwisu

👤 User Roles and Functionalities
Functionality	GUEST 👤	USER 🧑	ADMIN 🛠️
Browse movies and reviews	✅	✅	❌
Search for movies by title	✅	✅	❌
Register an account	✅	❌	❌
Submit, edit, and delete own reviews	❌	✅	❌
Manage profile (update info, change pwd)	❌	✅	❌
Access admin dashboard	❌	❌	✅
Manage users (view/delete)	❌	❌	✅
Manage movies (edit/delete)	❌	❌	✅
Add new movies	❌	❌	✅

Uruchomienie:
- Sklonować repozytorium git clone git@github.com:bamboo-tree/absolute-cinema.git
- Przejść do lokalizacji pliku cd absolute-cinema
- Uruchomienie bazy danych mongo
  - sudo systemctl start mongodb (linux)
  - korzystając z aplikacji desktopowej (windows)
- Uruchomienie serwera: 
  - cd ./server
  - npm install
  - node server.js
- Uruchomienie klienta:
  - cd ./client
  - npm install
  - npm start
- Przejście na stonę http://localhost:3000/home

(pliki .env są dodane jako przykład w celu uruchomienia serwisu, normalnie nie powinny się tutaj znaleźć ze względów bezpieczeństwa, jednak jako że jest to projekt w celach naukowych i żadne dane wrażliwe nie są udostępniane są one dołączone do repozytorium)




## Tech Stack
__Client:__
  - Java Script
  - HTML/CSS
  - React

__Server:__
  - Java Script
  - NodeJS
  - Express
  - MongoDB

## Wnioski
Czego się nauczyłem robiąc ten projekt:
- zarządzanie komunikacją między serwerm a klientem
- zabezpieczenia endpointów i weryfikacji uprawnień przy użyciu JWT
- MERN stack
- tworzenie komponentów w react
- zarządzeni danymi crud
- ...

Z każdym dniem jak robiłem ten projekt i poznawałem nowe rzeczy zauważałem błędy które wczesniej popełniałem. Nie uważam, że jest to idealny i w pełni funkcjonalny serwis, ponieważ z perspektywy czasu zacząłbym go robić w innej kolejności. Nie mnie jednak kiedyś trzeba powiedzieć stop. Doświadczenie, które tutaj zdobyłem na pewno przełoży się na lepszą jakość kolejnych projektów.
