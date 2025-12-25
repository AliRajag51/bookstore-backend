# Architecture Notes

This backend uses a simple layered structure:
- routes -> controllers -> services -> models

Swap in an ORM or DB layer as needed (e.g., Sequelize, TypeORM, Mongoose).
