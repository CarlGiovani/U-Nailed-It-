 - - - - - 

CODING STANDARDS DOCUMENT

 - - - - - 
 
This document defines coding standards for the project to ensure readable, maintainable, and consistent code.  
Following these standards helps developers work together efficiently and reduces errors.
This also ensures the codebase remains clean, professional, and maintainable.

 - - - - - 

NAMING CONVENTIONS

| Type           | Format        | Example           |
|----------------|---------------|-------------------|
| Variable       | camelCase     | fullName          |
| Function       | camelCase     | bookAppointment() |
| Class          | PascalCase    | AdminLogin        |
| Constant       | UPPERCASE     | MAX_APPOINTMENT   |
| Database Table | snake_case    | appointment_time  |

 - - - - - 
 
GUIDELINES

- Use descriptive, meaningful names.  
- Avoid single-letter or ambiguous names.  
- Prefix boolean variables with is or has (example: isActive, hasPermission).

 - - - - - 

INDENTIONS & SPACINGS

- Indentation: 4 spaces per level (do not use tabs).
- Blank lines: separate methods, logical sections, or major blocks.  
- Line length 80–120 characters max.  

 - - - - - 

BRACES / BLOCKINGS STYLES

Use K&R style (opening brace on the same line).

 - - - - - 

COMMENTS & DOCUMENTATIONS

- Use comments for non-obvious or complex logic.
- Avoid obvious comments (e.g., i++ // increment i).

 - - - - - 

ERROR HANDLING

- Always handle exceptions.
- Avoid empty catch blocks.
- Log errors clearly for debugging

 - - - - -

 VERSION CONTROL
 
- DRY: Don’t Repeat Yourself
- KISS: Keep It Simple, Stupid
- YAGNI: You Aren’t Gonna Need It
- Follow SOLID principles for object-oriented design.

 - - - - - 

FORMATTING & LINTING

 - Use tools to enforce consistent style.
 - Run linting before committing changes.
   
 - - - - - 

REFERENCES

Internal team wiki / style guide

 - - - - - 
