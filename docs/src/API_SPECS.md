# API Specification

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/fundraisings/{fundraiseId}/logo`

Get fundraise logo

**Parameters**

- `fundraiseId` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `string`

## ![PUT](https://placehold.co/50x24/fca130/ffffff/png?text=PUT) `/fundraisings/{fundraiseId}/logo`

Upload fundraise logo [OWNER ONLY]

**Parameters**

- `fundraiseId` (path, integer, required)

**Request body:** `object` (multipart/form-data)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `FileInfoDto`

## ![DELETE](https://placehold.co/80x24/f93e3e/ffffff/png?text=DELETE) `/fundraisings/{fundraiseId}/logo`

Remove fundraise logo [OWNER ONLY]

**Parameters**

- `fundraiseId` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/children/{childId}/avatar`

Get child avatar

**Parameters**

- `childId` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `string`

## ![PUT](https://placehold.co/50x24/fca130/ffffff/png?text=PUT) `/children/{childId}/avatar`

Set or replace child avatar

**Parameters**

- `childId` (path, integer, required)

**Request body:** `object` (multipart/form-data)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `FileInfoDto`

## ![DELETE](https://placehold.co/80x24/f93e3e/ffffff/png?text=DELETE) `/children/{childId}/avatar`

Delete child avatar

**Parameters**

- `childId` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK

## ![PUT](https://placehold.co/50x24/fca130/ffffff/png?text=PUT) `/auth/me/password`

Change password of the current user, requires current password

**Request body:** `PasswordChangeRequest` (application/json)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK

## ![PUT](https://placehold.co/50x24/fca130/ffffff/png?text=PUT) `/auth/me/email`

Change email of the current user, requires current password

**Request body:** `EmailChangeRequest` (application/json)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `UserResponse`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/payments/wallet/withdrawals`

Withdraw money from personal wallet to external account

**Request body:** `WithdrawRequest` (application/json)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `TransactionResponse`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/payments/wallet/deposits`

Deposit money on personal wallet

**Request body:** `DepositRequest` (application/json)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `TransactionResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/payments/saved-accounts`

Get saved external accounts of the user

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `SavedAccountResponse[]`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/payments/saved-accounts`

Save an external account

**Request body:** `SavedAccountCreateRequest` (application/json)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `SavedAccountResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/payments/fundraisings/{id}/withdrawals`

Get all fundraise withdraws, newest first

**Parameters**

- `id` (path, integer, required)
- `page` (query, integer)
- `size` (query, integer)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `FundraisingTransferResponse[]`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/payments/fundraisings/{id}/withdrawals`

Withdraw money from fundraise wallet to personal wallet

**Parameters**

- `id` (path, integer, required)

**Request body:** `FundraiseWithdrawRequest` (application/json)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `FundraisingTransferResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/payments/fundraisings/{id}/replenishments`

Get all fundraise replenishments, newest first

**Parameters**

- `id` (path, integer, required)
- `page` (query, integer)
- `size` (query, integer)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `FundraisingTransferResponse[]`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/payments/fundraisings/{id}/replenishments`

Return previously withdrawn money to fundraise wallet

**Parameters**

- `id` (path, integer, required)

**Request body:** `FundraiseReplenishRequest` (application/json)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `FundraisingTransferResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/payments/fundraisings/{id}/invoices`

Get fundraising invoices, newest first

**Parameters**

- `id` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `FundraisingInvoiceResponse[]`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/payments/fundraisings/{id}/invoices`

Add invoice to fundraising (class owner only)

**Parameters**

- `id` (path, integer, required)
- `title` (query, string)

**Request body:** `object` (multipart/form-data)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `FundraisingInvoiceResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/payments/fundraisings/{id}/contributions`

Get all fundraise contributions, newest first

**Parameters**

- `id` (path, integer, required)
- `page` (query, integer)
- `size` (query, integer)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `ContributionResponse[]`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/payments/fundraisings/{id}/contributions`

Pay on a fundraise

**Parameters**

- `id` (path, integer, required)

**Request body:** `FundraisePaymentRequest` (application/json)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `ContributionResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/fundraisings`

Find all fundraisings

**Parameters**

- `classId` (query, integer)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `FundraiseResponse[]`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/fundraisings`

Create new fundraise, creator became fundraise OWNER

**Request body:** `CreateFundraiseRequest` (application/json)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `FundraiseResponse`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/fundraisings/{fundraiseId}/refund`

Cancel a fundraise and refund all contributions to payers [OWNER ONLY]

**Parameters**

- `fundraiseId` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `RefundSummaryResponse`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/fundraisings/{fundraiseId}/close`

Close a fundraise [OWNER ONLY]

**Parameters**

- `fundraiseId` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `FundraiseResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/classes`

Get classes created by user and classes of user's children

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `ClassSummaryResponse[]`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/classes`

Create class, the user becomes its owner

**Request body:** `ClassCreateRequest` (application/json)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `ClassResponse`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/classes/{id}/membership/{childId}`

Accept child to class (owner only)

**Parameters**

- `id` (path, integer, required)
- `childId` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `MembershipResponse`

## ![DELETE](https://placehold.co/80x24/f93e3e/ffffff/png?text=DELETE) `/classes/{id}/membership/{childId}`

Remove child or pending request from class without trace (owner only)

**Parameters**

- `id` (path, integer, required)
- `childId` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/classes/{id}/membership/{childId}/reject`

Reject pending request, it stays visible with REJECTED status (owner only)

**Parameters**

- `id` (path, integer, required)
- `childId` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `MembershipResponse`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/classes/{id}/access-code/regenerate`

Generate new access code (owner only)

**Parameters**

- `id` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `AccessCodeResponse`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/classes/join`

Join class with a child by access code

**Request body:** `ClassJoinRequest` (application/json)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `MembershipResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/children`

Get all parent's children

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `ChildResponse[]`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/children`

Create child

**Request body:** `ChildCreateRequest` (application/json)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `ChildResponse`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/chats/{chatId}/read`

Mark all chat messages as read

**Parameters**

- `chatId` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/chats/{chatId}/messages`

Get chat messages, ordered from the oldest to the newest

**Parameters**

- `chatId` (path, integer, required)
- `before` (query, integer)
- `after` (query, integer)
- `size` (query, integer)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `MessageResponse[]`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/chats/{chatId}/messages`

Send message

**Parameters**

- `chatId` (path, integer, required)

**Request body:** `MessageCreateRequest` (application/json)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `MessageResponse`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/chats/{chatId}/hide`

Hide chat from the list of the current user

**Parameters**

- `chatId` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/chats/private`

Get or start private chat with a user

**Request body:** `PrivateChatRequest` (application/json)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `ChatResponse`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/auth/register`

**Request body:** `RegisterRequest` (application/json)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `AuthResponse`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/auth/login`

**Request body:** `LoginRequest` (application/json)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `AuthResponse`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/admin/users/{id}/block`

Block user account

**Parameters**

- `id` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `AdminUserResponse`

## ![DELETE](https://placehold.co/80x24/f93e3e/ffffff/png?text=DELETE) `/admin/users/{id}/block`

Unblock user account

**Parameters**

- `id` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `AdminUserResponse`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/admin/fundraisings/{id}/refund`

Refund all contributions of a blocked fundraising as administrator

**Parameters**

- `id` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `RefundSummaryResponse`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/admin/fundraisings/{id}/block`

Block fundraising

**Parameters**

- `id` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `AdminFundraisingResponse`

## ![DELETE](https://placehold.co/80x24/f93e3e/ffffff/png?text=DELETE) `/admin/fundraisings/{id}/block`

Unblock fundraising

**Parameters**

- `id` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `AdminFundraisingResponse`

## ![POST](https://placehold.co/60x24/49cc90/ffffff/png?text=POST) `/admin/classes/{id}/block`

Block class

**Parameters**

- `id` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `AdminClassResponse`

## ![DELETE](https://placehold.co/80x24/f93e3e/ffffff/png?text=DELETE) `/admin/classes/{id}/block`

Unblock class

**Parameters**

- `id` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `AdminClassResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/fundraisings/{fundraiseId}`

Find fundraise by id

**Parameters**

- `fundraiseId` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `FundraiseResponse`

## ![PATCH](https://placehold.co/70x24/50e3c2/ffffff/png?text=PATCH) `/fundraisings/{fundraiseId}`

Update a fundraise [OWNER ONLY]

**Parameters**

- `fundraiseId` (path, integer, required)

**Request body:** `UpdateFundraiseRequest` (application/json)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `FundraiseResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/classes/{id}`

Find class by id, including accepted children

**Parameters**

- `id` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `ClassResponse`

## ![DELETE](https://placehold.co/80x24/f93e3e/ffffff/png?text=DELETE) `/classes/{id}`

Delete class without fundraisings (owner only)

**Parameters**

- `id` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK

## ![PATCH](https://placehold.co/70x24/50e3c2/ffffff/png?text=PATCH) `/classes/{id}`

Update class (owner only)

**Parameters**

- `id` (path, integer, required)

**Request body:** `ClassUpdateRequest` (application/json)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `ClassResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/children/{childId}`

Find child by id

**Parameters**

- `childId` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `ChildResponse`

## ![DELETE](https://placehold.co/80x24/f93e3e/ffffff/png?text=DELETE) `/children/{childId}`

Remove child

**Parameters**

- `childId` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK

## ![PATCH](https://placehold.co/70x24/50e3c2/ffffff/png?text=PATCH) `/children/{childId}`

Update child

**Parameters**

- `childId` (path, integer, required)

**Request body:** `ChildUpdateRequest` (application/json)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `ChildResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/auth/me`

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `UserResponse`

## ![DELETE](https://placehold.co/80x24/f93e3e/ffffff/png?text=DELETE) `/auth/me`

Delete account of the current user, requires password

**Request body:** `AccountDeleteRequest` (application/json)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK

## ![PATCH](https://placehold.co/70x24/50e3c2/ffffff/png?text=PATCH) `/auth/me`

Change first and last name of the current user

**Request body:** `ProfileUpdateRequest` (application/json)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `UserResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/reports/fundraisings/{id}`

Generate a financial report for a fundraising

**Parameters**

- `id` (path, integer, required)
- `format` (query, string)
- `from` (query, string)
- `to` (query, string)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `string`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/reports/classes/{id}`

Generate a financial report for a class

**Parameters**

- `id` (path, integer, required)
- `format` (query, string)
- `from` (query, string)
- `to` (query, string)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `string`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/reports/children/{id}`

Generate a financial report for a child

**Parameters**

- `id` (path, integer, required)
- `format` (query, string)
- `from` (query, string)
- `to` (query, string)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `string`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/payments/wallet`

Get personal wallet information

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `WalletResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/payments/wallet/transactions`

Get all transactions related to wallet, newest first

**Parameters**

- `filter` (query, string)
- `from` (query, string)
- `to` (query, string)
- `minAmount` (query, number)
- `maxAmount` (query, number)
- `search` (query, string)
- `page` (query, integer)
- `size` (query, integer)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `TransactionResponse[]`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/payments/wallet/summary`

Get income and expense of wallet for the last days

**Parameters**

- `days` (query, integer)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `WalletSummaryResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/payments/wallet/contributions`

Get contributions from fundraises made by the user, newest first

**Parameters**

- `filter` (query, string)
- `from` (query, string)
- `to` (query, string)
- `minAmount` (query, number)
- `maxAmount` (query, number)
- `search` (query, string)
- `page` (query, integer)
- `size` (query, integer)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `WalletContributionResponse[]`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/payments/fundraisings/{id}`

Get fundraising summary with money statistics

**Parameters**

- `id` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `FundraisingSummaryResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/payments/fundraisings/{id}/wallet`

Get wallet of fundraising

**Parameters**

- `id` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `WalletResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/payments/fundraisings/{id}/refunds`

Get all fundraise refunds to payers, newest first

**Parameters**

- `id` (path, integer, required)
- `page` (query, integer)
- `size` (query, integer)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `FundraisingTransferResponse[]`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/payments/fundraisings/{id}/invoices/{invoiceId}/file`

Get invoice file

**Parameters**

- `id` (path, integer, required)
- `invoiceId` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `string`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/payments/fundraisings/{id}/children`

Get accepted children of the class with their payment status for the fundraising

**Parameters**

- `id` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `FundraisingChildResponse[]`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/payments/dashboard/fundraisings`

Get fundraisings of classes owned by the user with balances and payment progress, newest first

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `OwnedFundraisingResponse[]`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/payments/dashboard/dues`

Get outstanding payments for children of the user, nearest deadline first

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `DueResponse[]`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/notifications`

Notifications for the treasurer: pending child requests and recent payments

**Parameters**

- `since` (query, string)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `NotificationsResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/classes/{id}/membership`

Get pending membership requests (owner only)

**Parameters**

- `id` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `PendingMembershipResponse[]`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/classes/lookup`

Look up class by access code

**Parameters**

- `code` (query, string, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `ClassLookupResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/chats`

Get user's chats (class and private), most recently active first

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `ChatResponse[]`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/chats/{chatId}`

Find chat by id

**Parameters**

- `chatId` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `ChatResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/chats/contacts`

Get users the current user can start a private chat with

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `ChatUserResponse[]`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/chats/class/{classId}`

Get class chat (class owner and parents of accepted children)

**Parameters**

- `classId` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `ChatResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/admin/users`

Get all users, newest first

**Parameters**

- `search` (query, string)
- `role` (query, string)
- `blocked` (query, boolean)
- `classId` (query, integer)
- `from` (query, string)
- `to` (query, string)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `AdminUserResponse[]`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/admin/users/{id}`

Get user details with classes, children, wallet balance and fundraising count

**Parameters**

- `id` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `AdminUserResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/admin/treasurers`

Get all treasurers, newest first

**Parameters**

- `search` (query, string)
- `role` (query, string)
- `blocked` (query, boolean)
- `classId` (query, integer)
- `from` (query, string)
- `to` (query, string)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `AdminTreasurerResponse[]`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/admin/stats`

Get system-wide counters for the administration dashboard

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `AdminStatsResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/admin/reports/summary`

Get system-wide financial report grouped by month

**Parameters**

- `from` (query, string)
- `to` (query, string)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `AdminMonthlyReportResponse[]`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/admin/fundraisings`

Get all fundraisings, newest first

**Parameters**

- `search` (query, string)
- `status` (query, string)
- `blocked` (query, boolean)
- `classId` (query, integer)
- `ownerId` (query, integer)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `AdminFundraisingResponse[]`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/admin/fundraisings/{id}`

Get fundraising details with wallet and payment summary

**Parameters**

- `id` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `AdminFundraisingResponse`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/admin/classes`

Get all classes, newest first

**Parameters**

- `search` (query, string)
- `blocked` (query, boolean)
- `ownerId` (query, integer)
- `includeDeleted` (query, boolean)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `AdminClassResponse[]`

## ![GET](https://placehold.co/50x24/61affe/ffffff/png?text=GET) `/admin/classes/{id}`

Get class details with members and fundraisings

**Parameters**

- `id` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK: `AdminClassResponse`

## ![DELETE](https://placehold.co/80x24/f93e3e/ffffff/png?text=DELETE) `/payments/saved-accounts/{id}`

Remove a saved external account

**Parameters**

- `id` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK

## ![DELETE](https://placehold.co/80x24/f93e3e/ffffff/png?text=DELETE) `/classes/{classId}/child/{childId}`

Remove child from class (child's parent or owner)

**Parameters**

- `classId` (path, integer, required)
- `childId` (path, integer, required)

**Responses**

- ![200](https://placehold.co/50x24/49cc90/ffffff/png?text=200) OK

# Schemas

## FileInfoDto

- `id`: integer
- `filename`: string
- `contentType`: string
- `sizeBytes`: integer

## PasswordChangeRequest

- `currentPassword`: string (required)
- `newPassword`: string (required)

## EmailChangeRequest

- `email`: string (required)
- `currentPassword`: string (required)

## UserResponse

- `id`: integer
- `email`: string
- `firstName`: string
- `lastName`: string
- `role`: string
- `createdAt`: string

## WithdrawRequest

- `amount`: number (required)
- `recipientName`: string (required)
- `iban`: string (required)

## TransactionResponse

- `id`: integer
- `type`: string
- `amount`: number
- `title`: string
- `status`: string
- `incoming`: boolean
- `createdAt`: string
- `completedAt`: string

## DepositRequest

- `amount`: number (required)

## SavedAccountCreateRequest

- `recipientName`: string (required)
- `iban`: string (required)

## SavedAccountResponse

- `id`: integer
- `recipientName`: string
- `iban`: string

## FundraiseWithdrawRequest

- `amount`: number (required)
- `title`: string (required)

## FundraisingTransferResponse

- `id`: integer
- `type`: string
- `amount`: number
- `title`: string
- `createdAt`: string
- `completedAt`: string

## FundraiseReplenishRequest

- `amount`: number (required)

## FundraisingInvoiceResponse

- `id`: integer
- `title`: string
- `file`: FileInfoDto
- `createdAt`: string

## FundraisePaymentRequest

- `childId`: integer (required)
- `amount`: number (required)

## ContributionPersonResponse

- `id`: integer
- `firstName`: string
- `lastName`: string

## ContributionResponse

- `id`: integer
- `fundraisingId`: integer
- `payer`: ContributionPersonResponse
- `child`: ContributionPersonResponse
- `amount`: number
- `createdAt`: string
- `refunded`: boolean
- `refundedAt`: string

## CreateFundraiseRequest

- `classId`: integer (required)
- `name`: string (required)
- `description`: string
- `endDate`: string (required)
- `perChildAmount`: number (required)

## FundraiseResponse

- `id`: integer
- `classId`: integer
- `isOwner`: boolean
- `name`: string
- `description`: string
- `startDate`: string
- `endDate`: string
- `amountPerChild`: number
- `status`: string
- `cancelledAt`: string
- `closedAt`: string
- `isBlocked`: boolean
- `isClassBlocked`: boolean

## RefundSummaryResponse

- `fundraisingId`: integer
- `status`: string
- `refundedContributions`: integer
- `refundedAmount`: number
- `cancelledAt`: string

## ClassCreateRequest

- `name`: string (required)
- `school`: string (required)
- `city`: string (required)

## ClassChildResponse

- `id`: integer
- `firstName`: string
- `lastName`: string
- `avatarId`: integer
- `parent`: PersonResponse

## ClassResponse

- `id`: integer
- `name`: string
- `school`: string
- `city`: string
- `accessCode`: string
- `isOwner`: boolean
- `owner`: PersonResponse
- `children`: ClassChildResponse[]
- `createdAt`: string
- `isBlocked`: boolean

## PersonResponse

- `id`: integer
- `firstName`: string
- `lastName`: string

## MembershipResponse

- `classId`: integer
- `childId`: integer
- `childFirstName`: string
- `childLastName`: string
- `status`: string
- `requestedAt`: string
- `decidedAt`: string

## AccessCodeResponse

- `accessCode`: string

## ClassJoinRequest

- `accessCode`: string (required)
- `childId`: integer (required)

## ChildCreateRequest

- `firstname`: string (required)
- `lastname`: string (required)
- `birthDate`: string (required)

## ChildResponse

- `id`: integer
- `firstname`: string
- `lastname`: string
- `birthDate`: string
- `avatarId`: integer

## MessageCreateRequest

- `content`: string (required)

## ChatUserResponse

- `id`: integer
- `firstName`: string
- `lastName`: string
- `deleted`: boolean

## MessageResponse

- `id`: integer
- `chatId`: integer
- `sender`: ChatUserResponse
- `content`: string
- `createdAt`: string

## PrivateChatRequest

- `userId`: integer (required)

## ChatResponse

- `id`: integer
- `type`: string
- `title`: string
- `classId`: integer
- `otherUser`: ChatUserResponse
- `lastMessage`: MessageResponse
- `unreadCount`: integer
- `canSend`: boolean
- `createdAt`: string

## RegisterRequest

- `email`: string (required)
- `firstName`: string (required)
- `lastName`: string (required)
- `password`: string (required)

## AuthResponse

- `accessToken`: string
- `tokenType`: string
- `expiresIn`: integer
- `user`: UserResponse

## LoginRequest

- `email`: string (required)
- `password`: string (required)

## AdminClassRefResponse

- `id`: integer
- `name`: string
- `school`: string
- `city`: string
- `isBlocked`: boolean

## AdminUserResponse

- `id`: integer
- `email`: string
- `firstName`: string
- `lastName`: string
- `role`: string
- `isBlocked`: boolean
- `createdAt`: string
- `updatedAt`: string
- `classes`: AdminClassRefResponse[]
- `children`: ChildResponse[]
- `walletBalance`: number
- `ownedFundraisingCount`: integer

## AdminFundraisingResponse

- `id`: integer
- `name`: string
- `status`: string
- `isBlocked`: boolean
- `isClassBlocked`: boolean
- `schoolClass`: AdminClassRefResponse
- `treasurer`: AdminUserRefResponse
- `amountPerChild`: number
- `collected`: number
- `balance`: number
- `endAt`: string
- `createdAt`: string
- `description`: string
- `cancelledAt`: string
- `closedAt`: string
- `updatedAt`: string
- `childrenCount`: integer
- `paidChildrenCount`: integer

## AdminUserRefResponse

- `id`: integer
- `email`: string
- `firstName`: string
- `lastName`: string

## AdminClassResponse

- `id`: integer
- `name`: string
- `school`: string
- `city`: string
- `owner`: AdminUserRefResponse
- `memberCount`: integer
- `fundraisingCount`: integer
- `isBlocked`: boolean
- `deletedAt`: string
- `createdAt`: string
- `accessCode`: string
- `updatedAt`: string
- `members`: ClassChildResponse[]
- `fundraisings`: AdminFundraisingResponse[]

## UpdateFundraiseRequest

- `name`: string
- `description`: string
- `endDate`: string
- `perChildAmount`: number

## ClassUpdateRequest

- `name`: string
- `school`: string
- `city`: string

## ChildUpdateRequest

- `firstname`: string
- `lastname`: string
- `birthDate`: string

## ProfileUpdateRequest

- `firstName`: string (required)
- `lastName`: string (required)

## WalletResponse

- `id`: integer
- `iban`: string
- `balance`: number

## DailyFlowResponse

- `date`: string
- `income`: number
- `expense`: number

## WalletSummaryResponse

- `days`: integer
- `income`: number
- `expense`: number
- `daily`: DailyFlowResponse[]

## WalletContributionResponse

- `id`: integer
- `fundraisingId`: integer
- `fundraisingName`: string
- `child`: ContributionPersonResponse
- `amount`: number
- `createdAt`: string
- `refunded`: boolean
- `refundedAt`: string

## FundraisingSummaryResponse

- `id`: integer
- `name`: string
- `description`: string
- `startDate`: string
- `endDate`: string
- `amountPerChild`: number
- `status`: string
- `isBlocked`: boolean
- `isClassBlocked`: boolean
- `acceptsPayments`: boolean
- `classId`: integer
- `className`: string
- `isOwner`: boolean
- `walletBalance`: number
- `collectedAmount`: number
- `withdrawnAmount`: number
- `paidChildren`: integer
- `totalChildren`: integer

## FundraisingChildResponse

- `id`: integer
- `firstName`: string
- `lastName`: string
- `avatarId`: integer
- `isMine`: boolean
- `paidAmount`: number
- `remainingAmount`: number
- `isPaid`: boolean

## OwnedFundraisingResponse

- `id`: integer
- `name`: string
- `status`: string
- `isBlocked`: boolean
- `isClassBlocked`: boolean
- `endDate`: string
- `amountPerChild`: number
- `iban`: string
- `walletBalance`: number
- `collectedAmount`: number
- `paidChildren`: integer
- `totalChildren`: integer

## DueResponse

- `fundraisingId`: integer
- `fundraisingName`: string
- `endDate`: string
- `child`: ContributionPersonResponse
- `amountPerChild`: number
- `paidAmount`: number
- `remainingAmount`: number

## NotificationItem

- `id`: string
- `type`: string
- `title`: string
- `description`: string
- `link`: string
- `createdAt`: string

## NotificationsResponse

- `treasurer`: boolean
- `items`: NotificationItem[]

## ClassSummaryResponse

- `id`: integer
- `name`: string
- `school`: string
- `city`: string
- `isOwner`: boolean
- `owner`: PersonResponse
- `childrenCount`: integer
- `myChildren`: MembershipResponse[]
- `deletedAt`: string
- `isBlocked`: boolean

## PendingMembershipResponse

- `child`: ClassChildResponse
- `parentEmail`: string
- `requestedAt`: string

## ClassLookupResponse

- `id`: integer
- `name`: string
- `school`: string
- `city`: string
- `ownerId`: integer

## AdminTreasurerResponse

- `id`: integer
- `email`: string
- `firstName`: string
- `lastName`: string
- `isBlocked`: boolean
- `createdAt`: string
- `classes`: AdminClassRefResponse[]
- `fundraisingCount`: integer
- `collected`: number

## AdminStatsResponse

- `users`: integer
- `treasurers`: integer
- `activeFundraisings`: integer
- `finishedFundraisings`: integer
- `closedFundraisings`: integer
- `cancelledFundraisings`: integer
- `blockedUsers`: integer
- `blockedClasses`: integer
- `blockedFundraisings`: integer

## AdminMonthlyReportResponse

- `month`: string
- `newUsers`: integer
- `newFundraisings`: integer
- `turnover`: number

## AccountDeleteRequest

- `password`: string (required)
