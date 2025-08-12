## Vistagram

A instagram alike project

### Run project

Frontend:

```
cd frontend

npm install

npm run start
```

Backend:

```
cd backend
# install docker

docker pull postgres

docker run --name vistagram-postgres-db -e POSTGRES_PASSWORD=adminaccess4postg -p 5432:5432 -d postgres

python3 -m venv .venv

. .venv/bin/activate

pip install -r requirements.txt

flask --app run.py run

```

## Tech Stack

**Client:** React, Styled Component

**Backend:** Flask, Postgres

### [Database Design](https://dbdiagram.io/d/Vistagram_database_design-689825d8dd90d178653c456f)
