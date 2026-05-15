# Pairly APIs

An application can have n number of apis. Best practice to implement apis using express router to group similar path apis together that ensures better readabilit and cleaner code. It also helps in debugging.

authRouter
- POST /signup
- POST /login
- POST /logout

profileRouter
- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password - forgot password API

connectionRequestRouter
- POST /request/send/status/:userId.    --> allowed statuses ["ignored", "interested"]
- POST /request/review/status/:requestId  --> allowed statuses ["accepted", "rejected"]

userRouter
- GET /user/requests/received
- GET /user/connections
- GET /user/feed - Gets you the profiles of other users on platform

Status: ignore, interested, accepted, rejected