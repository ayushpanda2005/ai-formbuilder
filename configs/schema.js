import { pgTable, serial, text, varchar, integer, boolean } from 'drizzle-orm/pg-core';

// Define the JsonForms table schema
export const JsonForms = pgTable('jsonForms', {
    id: serial('id').primaryKey(),
    jsonform: text('jsonform').notNull(),
    theme: varchar('theme'),
    background: varchar('background'),
    style: varchar('style'),
    createdBy: varchar('createdBy').notNull(),
    createdAt: varchar('createdAt').notNull(),
    enabledSignIn:boolean('enabledSignIn').default(false)
    
});

// Define the userResponses table schema
export const userResponses = pgTable('userResponses', {
    id: serial('id').primaryKey(),
    jsonResponse: text('jsonResponse').notNull(),
    createdBy: varchar('createdBy').default('anonymous'),
    createdAt: varchar('createdAt').notNull(),
    formRef: integer('formRef').references(() => JsonForms.id) // Foreign key to JsonForms
});
