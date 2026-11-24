# SchoolMoney, lista endpointów REST API

## 1. Informacje ogólne

| | |
|---|---|
| Adres bazowy API | `http://localhost/api` |
| Swagger UI | `http://localhost/api/swagger` |
| Specyfikacja OpenAPI (JSON) | `http://localhost/api/v3/api-docs`|
| Uwierzytelnianie | token JWT w nagłówku `Authorization: Bearer <token>` |
| Liczba endpointów | 74 |

### 1.1. Uwierzytelnianie

Token JWT zwracają endpointy `POST /auth/register` i `POST /auth/login` (pole `accessToken`). Wszystkie pozostałe endpointy, poza oznaczonymi jako publiczne, wymagają tego tokenu.

### 1.2. Kody odpowiedzi i błędy

| Kod | Znaczenie |
|---|---|
| 200 OK | Operacja udana, odpowiedź zawiera dane. |
| 201 Created | Utworzono zasób |
| 204 No Content | Operacja udana, odpowiedź bez treści (np. usunięcie). |
| 400 Bad Request | Błędne dane wejściowe – walidacja pól albo niepoprawny JSON. |
| 401 Unauthorized | Brak tokenu, token nieważny albo konto zablokowane; przy logowaniu – zły e-mail lub hasło. |
| 403 Forbidden | Brak uprawnień do zasobu albo błędne obecne hasło przy zmianie danych konta. |
| 404 Not Found | Zasób nie istnieje albo użytkownik nie ma do niego dostępu. |
| 409 Conflict | Operacja sprzeczna ze stanem danych (np. zajęty e-mail, niewystarczające środki, usunięcie konta prowadzącego klasę). |

## 2. Zestawienie endpointów

### Uwierzytelnianie i konto użytkownika

| Metoda | Ścieżka | Opis | Dostęp |
|---|---|---|---|
| `POST` | `/auth/login` | Logowanie adresem e-mail i hasłem. Zwraca token JWT. | publiczny |
| `GET` | `/auth/me` | Dane zalogowanego użytkownika. | JWT |
| `PATCH` | `/auth/me` | Zmiana imienia i nazwiska zalogowanego użytkownika. | JWT |
| `DELETE` | `/auth/me` | Usunięcie konta zalogowanego użytkownika, wymaga podania hasła. | JWT |
| `PUT` | `/auth/me/email` | Zmiana adresu e-mail, wymaga podania obecnego hasła. | JWT |
| `PUT` | `/auth/me/password` | Zmiana hasła, wymaga podania obecnego hasła. | JWT |
| `POST` | `/auth/register` | Rejestracja nowego konta. Zwraca token JWT.| publiczny |

### Dzieci

| Metoda | Ścieżka | Opis | Dostęp |
|---|---|---|---|
| `GET` | `/children` | Lista dzieci zalogowanego rodzica. | JWT |
| `POST` | `/children` | Dodanie dziecka. | JWT |
| `GET` | `/children/{childId}` | Szczegóły dziecka. | JWT |
| `PATCH` | `/children/{childId}` | Edycja danych dziecka. | JWT |
| `DELETE` | `/children/{childId}` | Usunięcie dziecka. | JWT |
| `GET` | `/children/{childId}/avatar` | Pobranie zdjęcia (awatara) dziecka. | JWT |
| `PUT` | `/children/{childId}/avatar` | Ustawienie lub zmiana awatara dziecka (plik obrazu). | JWT |
| `DELETE` | `/children/{childId}/avatar` | Usunięcie awatara dziecka. | JWT |

### Klasy

| Metoda | Ścieżka | Opis | Dostęp |
|---|---|---|---|
| `GET` | `/classes` | Lista klas: prowadzonych przez użytkownika oraz klas, do których należą jego dzieci. | JWT |
| `POST` | `/classes` | Utworzenie klasy; użytkownik zostaje jej skarbnikiem (właścicielem). | JWT |
| `DELETE` | `/classes/{classId}/child/{childId}` | Wypisanie dziecka z klasy (rodzic dziecka albo skarbnik). | JWT |
| `GET` | `/classes/{id}` | Szczegóły klasy wraz z przyjętymi dziećmi. | JWT |
| `PATCH` | `/classes/{id}` | Edycja klasy (tylko skarbnik). | JWT |
| `DELETE` | `/classes/{id}` | Usunięcie klasy, która nie ma zbiórek (tylko skarbnik). | JWT |
| `POST` | `/classes/{id}/access-code/regenerate` | Wygenerowanie nowego kodu dostępu do klasy (tylko skarbnik). | JWT |
| `GET` | `/classes/{id}/membership` | Oczekujące zgłoszenia dzieci do klasy (tylko skarbnik). | JWT |
| `POST` | `/classes/{id}/membership/{childId}` | Przyjęcie dziecka do klasy (tylko skarbnik). | JWT |
| `DELETE` | `/classes/{id}/membership/{childId}` | Usunięcie dziecka lub oczekującego zgłoszenia z klasy bez śladu (tylko skarbnik). | JWT |
| `POST` | `/classes/{id}/membership/{childId}/reject` | Odrzucenie zgłoszenia; zostaje widoczne ze statusem REJECTED (tylko skarbnik). | JWT |
| `POST` | `/classes/join` | Zgłoszenie dziecka do klasy przy użyciu kodu dostępu. | JWT |
| `GET` | `/classes/lookup` | Sprawdzenie klasy po kodzie dostępu (przed dołączeniem). Endpoint publiczny. | publiczny |

### Zbiórki

| Metoda | Ścieżka | Opis | Dostęp |
|---|---|---|---|
| `GET` | `/fundraisings` | Lista zbiórek. | JWT |
| `POST` | `/fundraisings` | Utworzenie zbiórki; twórca zostaje jej właścicielem. | JWT |
| `GET` | `/fundraisings/{fundraiseId}` | Szczegóły zbiórki. | JWT |
| `PATCH` | `/fundraisings/{fundraiseId}` | Edycja zbiórki (tylko właściciel). | JWT |
| `POST` | `/fundraisings/{fundraiseId}/close` | Zamknięcie zbiórki (tylko właściciel). | JWT |
| `GET` | `/fundraisings/{fundraiseId}/logo` | Pobranie logo zbiórki. | JWT |
| `PUT` | `/fundraisings/{fundraiseId}/logo` | Wgranie logo zbiórki (tylko właściciel). | JWT |
| `DELETE` | `/fundraisings/{fundraiseId}/logo` | Usunięcie logo zbiórki (tylko właściciel). | JWT |
| `POST` | `/fundraisings/{fundraiseId}/refund` | Anulowanie zbiórki i zwrot wszystkich wpłat rodzicom (tylko właściciel). | JWT |

### Szczegóły zbiórki i faktury

| Metoda | Ścieżka | Opis | Dostęp |
|---|---|---|---|
| `GET` | `/payments/fundraisings/{id}` | Podsumowanie zbiórki ze statystykami finansowymi. | JWT |
| `GET` | `/payments/fundraisings/{id}/children` | Przyjęte dzieci klasy ze statusem płatności w zbiórce. | JWT |
| `GET` | `/payments/fundraisings/{id}/invoices` | Faktury zbiórki, od najnowszych. | JWT |
| `POST` | `/payments/fundraisings/{id}/invoices` | Dodanie faktury do zbiórki (tylko skarbnik). | JWT |
| `GET` | `/payments/fundraisings/{id}/invoices/{invoiceId}/file` | Pobranie pliku faktury. | JWT |

### Płatności i rachunki

| Metoda | Ścieżka | Opis | Dostęp |
|---|---|---|---|
| `GET` | `/payments/fundraisings/{id}/contributions` | Wpłaty na zbiórkę, od najnowszych. | JWT |
| `POST` | `/payments/fundraisings/{id}/contributions` | Wpłata na zbiórkę. | JWT |
| `GET` | `/payments/fundraisings/{id}/refunds` | Zwroty wpłat dla rodziców (po anulowaniu zbiórki), od najnowszych. | JWT |
| `GET` | `/payments/fundraisings/{id}/replenishments` | Zwroty środków na rachunek zbiórki, od najnowszych. | JWT |
| `POST` | `/payments/fundraisings/{id}/replenishments` | Zwrot wcześniej wypłaconych środków na rachunek zbiórki. | JWT |
| `GET` | `/payments/fundraisings/{id}/wallet` | Rachunek zbiórki. | JWT |
| `GET` | `/payments/fundraisings/{id}/withdrawals` | Wypłaty z rachunku zbiórki, od najnowszych. | JWT |
| `POST` | `/payments/fundraisings/{id}/withdrawals` | Wypłata środków z rachunku zbiórki na rachunek osobisty skarbnika. | JWT |
| `GET` | `/payments/wallet` | Informacje o rachunku osobistym (saldo, numer konta). | JWT |
| `GET` | `/payments/wallet/contributions` | Wpłaty użytkownika na zbiórki, od najnowszych. | JWT |
| `POST` | `/payments/wallet/deposits` | Wpłata pieniędzy na rachunek osobisty. | JWT |
| `GET` | `/payments/wallet/summary` | Wpływy i wydatki rachunku z ostatnich dni (do wykresu). | JWT |
| `GET` | `/payments/wallet/transactions` | Historia transakcji rachunku osobistego, od najnowszych, z filtrami i stronicowaniem. | JWT |
| `POST` | `/payments/wallet/withdrawals` | Wypłata pieniędzy z rachunku osobistego na konto zewnętrzne. | JWT |

### Pulpit płatności

| Metoda | Ścieżka | Opis | Dostęp |
|---|---|---|---|
| `GET` | `/payments/dashboard/dues` | Zaległe płatności za dzieci użytkownika, od najbliższego terminu. | JWT |
| `GET` | `/payments/dashboard/fundraisings` | Zbiórki z klas prowadzonych przez użytkownika z saldem i postępem wpłat, od najnowszych. | JWT |

### Zapisane konta zewnętrzne

| Metoda | Ścieżka | Opis | Dostęp |
|---|---|---|---|
| `GET` | `/payments/saved-accounts` | Zapisane konta zewnętrzne użytkownika, do wyboru przy wypłacie. | JWT |
| `POST` | `/payments/saved-accounts` | Zapisanie konta zewnętrznego. | JWT |
| `DELETE` | `/payments/saved-accounts/{id}` | Usunięcie zapisanego konta zewnętrznego. | JWT |

### Raporty

| Metoda | Ścieżka | Opis | Dostęp |
|---|---|---|---|
| `GET` | `/reports/children/{id}` | Raport finansowy dziecka w formacie PDF lub CSV, opcjonalnie za wybrany okres (rodzic dziecka, skarbnik, administrator). | JWT |
| `GET` | `/reports/classes/{id}` | Raport finansowy klasy w formacie PDF lub CSV, opcjonalnie za wybrany okres (skarbnik, administrator). | JWT |
| `GET` | `/reports/fundraisings/{id}` | Raport finansowy zbiórki w formacie PDF lub CSV, opcjonalnie za wybrany okres (skarbnik, rodzice przyjętych dzieci, administrator). | JWT |

### Powiadomienia

| Metoda | Ścieżka | Opis | Dostęp |
|---|---|---|---|
| `GET` | `/notifications` | Powiadomienia skarbnika: oczekujące zgłoszenia dzieci i ostatnie wpłaty. | JWT |

### Czat

| Metoda | Ścieżka | Opis | Dostęp |
|---|---|---|---|
| `GET` | `/chats` | Rozmowy użytkownika (klasowe i prywatne), od ostatnio aktywnych. | JWT |
| `GET` | `/chats/{chatId}` | Szczegóły rozmowy. | JWT |
| `POST` | `/chats/{chatId}/hide` | Ukrycie rozmowy na liście zalogowanego użytkownika. | JWT |
| `GET` | `/chats/{chatId}/messages` | Wiadomości rozmowy, od najstarszej do najnowszej. | JWT |
| `POST` | `/chats/{chatId}/messages` | Wysłanie wiadomości. | JWT |
| `POST` | `/chats/{chatId}/read` | Oznaczenie wszystkich wiadomości rozmowy jako przeczytanych. | JWT |
| `GET` | `/chats/class/{classId}` | Czat klasy (skarbnik i rodzice przyjętych dzieci). | JWT |
| `GET` | `/chats/contacts` | Osoby, z którymi użytkownik może rozpocząć prywatną rozmowę. | JWT |
| `POST` | `/chats/private` | Otwarcie istniejącej lub rozpoczęcie nowej prywatnej rozmowy z użytkownikiem. | JWT |