# School Money - opis projektu

## 1. Koncepcja

School Money to aplikacja webowa wspierająca organizację klasowych zbiórek pieniędzy. 
Skarbnik klasy (rodzic) zakłada klasę, zaprasza pozostałych rodziców kodem dostępu, tworzy zbiórki i rozlicza wpłaty.
Rodzice opłacają składki przypisane do swoich dzieci, śledzą historię operacji i komunikują się przez wbudowany czat. 
Administrator czuwa nad bezpieczeństwem systemu: blokuje konta, klasy i zbiórki, wykonuje zwroty oraz przegląda raporty.
Każda zmiana salda jest wynikiem zapisanej transakcji, więc wpłaty, wypłaty i zwroty można jednoznacznie prześledzić.

## 2. Role i uprawnienia

- **USER** - rola domyślna. To samo konto może być rodzicem, skarbnikiem lub obydwoma jednocześnie.
- **ADMIN** - dostęp do panelu administracyjnego (`/dashboard/admin`).
- **Skarbnik** - właściciel klasy. Tylko on tworzy i edytuje zbiórki, zatwierdza dzieci, wypłaca i uzupełnia środki, 
zamyka zbiórki oraz generuje raporty klasy.
- **Rodzic** - widzi klasy i zbiórki, do których należy jego zaakceptowane dziecko; może wpłacać, 
zgłaszać dziecko do klasy i korzystać z czatu.


## 3. Jak to działa

### Konto i klasa

Rejestracja zawsze tworzy konto `USER`. Skarbnik zakłada klasę i otrzymuje unikalny kod dostępu. Rodzic dodaje dziecko, 
a następnie dołącza do klasy kodem - zgłoszenie trafia do skarbnika jako `PENDING`. Dodanie własnego dziecka przez skarbnika jest akceptowane od razu. Skarbnik zatwierdza lub odrzuca zgłoszenia. Klasę można usunąć tylko wtedy, gdy nie ma ona zbiórek; usunięcie jest miękkie, a członkostwa przechodzą w stan `CLASS_DELETED`.

### Zbiórka

Skarbnik podaje nazwę, opis, termin i kwotę przypadającą na dziecko. System automatycznie tworzy portfel zbiórki. 
Zbiórka jest widoczna dla właściciela klasy oraz rodziców zaakceptowanych dzieci.

### Wpłaty

Rodzic wpłaca z własnego portfela na portfel zbiórki. System pilnuje, aby suma wpłat danego dziecka nie przekroczyła kwoty 
na dziecko oraz aby zbiórka była aktywna, nieprzeterminowana i nieblokowana. Wpłata może być podzielona na części. 
Portfel rodzica zasilany jest wirtualnym depozytem, a środki można wypłacić na zewnętrzny rachunek bankowy.
Możliwe jest zapłacenie za nie swoje dziecko.

### Wypłata i uzupełnienie

Skarbnik może wypłacić środki ze zbiórki na swój portfel (`PAYOUT`), a następnie uzupełnić je z powrotem do wysokości 
wcześniej wypłaconej kwoty (`REPLENISHMENT`). Dzięki temu system wie, ile pieniędzy opuściło portfel zbiórki i czy zostały zwrócone.

### Zamknięcie i zwrot

Zamknięcie zbiórki jest możliwe tylko przy zerowym saldzie jej portfela. Zwrot wykonywany przez skarbnika anuluje zbiórkę 
i oddaje każdą wpłatę na portfel płatnika; wymaga pokrycia pełnej sumy wpłat w portfelu zbiórki. Obniżenie kwoty na dziecko powoduje automatyczny zwrot nadpłat.

### Blokady

Administrator może zablokować konto, klasę oraz zbiórkę. Skutki blokady:

- brak nowych wpłat, wypłat, uzupełnień i zwrotów skarbnika
- brak edycji zbiórki, zmiany logo, zamykania, zatwierdzania dzieci i zmiany kodu klasy
- zablokowane pozycje są wyłączone z pulpitów i list operacyjnych („Moje”, „Moich dzieci”, „Trwające”, „Zakończone”),
ale pozostają widoczne na listach „Wszystkie” i „Zablokowane” oraz w szczegółach w trybie tylko do odczytu
- rodzic może nadal wypisać dziecko z klasy lub wycofać oczekujące zgłoszenie
- zablokowane konto nie może się zalogować

Zwrot z zablokowanej zbiórki może wykonać wyłącznie administrator. Jeśli portfel zbiórki nie pokrywa wszystkich wpłat, 
brakująca kwota jest najpierw przelewana z portfela właściciela klasy. Panel administracyjny traktuje zbiórki zablokowane przez klasę jak zablokowane - dotyczy to filtrów, list i statystyk.

### Raporty, powiadomienia i czat

System generuje raporty PDF i CSV - dla zbiórki, klasy oraz dziecka. Zakres dostępu zależy od raportu: 
obejmuje właściciela klasy, rodzica dziecka lub administratora. Skarbnik otrzymuje powiadomienia o oczekujących zgłoszeniach 
i nowych wpłatach. Czat obejmuje rozmowy klasowe i prywatne, historię wiadomości, oznaczanie jako przeczytane 
oraz ukrywanie rozmów.

## 4. Założenia i ograniczenia

- System operuje na **wirtualnych pieniądzach** - nie integruje się z bankiem; salda są zapisem księgowym.
- Dziecko może należeć do jednej aktywnej klasy, natomiast konto rodzica może uczestniczyć w wielu klasach.
- Kwoty są wyrażone w złotych; salda i kwoty operacji są walidowane po stronie backendu.
- Backend i baza danych pracują w UTC, a konwersja na czas lokalny odbywa się we frontendzie.
- Konto administratora jest tworzone przy starcie aplikacji na podstawie zmiennych środowiskowych.
- Blokady są odwracalne i niekaskadowe; historia operacji pozostaje nienaruszona.
