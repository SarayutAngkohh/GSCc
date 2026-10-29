# Security Specification

## Data Invariants
1. Task documents must have valid titles, start/end dates, category IDs, and status values.
2. Category documents must have a valid name and color.
3. Subtasks, attachments, and history items in tasks must conform to bounded arrays.

## Rules Overview
- `/tasks/{taskId}`: Allow read, create, update, delete for users with valid inputs.
- `/categories/{categoryId}`: Allow read, create, update for custom categories.
