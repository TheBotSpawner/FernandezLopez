import { CONTACTS } from '@/mocks/contacts'
import { loadOrSeed, persist } from '@/lib/local-store'
import type { Contact, ContactInput, ContactNote, ContactQuery } from '@/types/contact'

const CONTACTS_KEY = 'fl.crm.contacts'
const NOTES_KEY = 'fl.crm.contact-notes'

let contacts: Contact[] = loadOrSeed(CONTACTS_KEY, CONTACTS)
let notes: ContactNote[] = loadOrSeed(NOTES_KEY, [])

function saveContacts() {
  persist(CONTACTS_KEY, contacts)
}
function saveNotes() {
  persist(NOTES_KEY, notes)
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

function matchesQuery(contact: Contact, query: ContactQuery): boolean {
  if (query.branchId && query.branchId !== 'all' && contact.branchId !== query.branchId) return false
  if (query.assignedUserId && contact.assignedUserId !== query.assignedUserId) return false
  if (query.roles?.length && !query.roles.some((role) => contact.roles.includes(role))) return false
  if (query.search) {
    const needle = normalize(query.search)
    const haystack = normalize(`${contact.fullName} ${contact.phone} ${contact.email}`)
    if (!haystack.includes(needle)) return false
  }
  return true
}

export async function getContacts(query: ContactQuery = {}): Promise<Contact[]> {
  await delay(200)
  return contacts.filter((contact) => matchesQuery(contact, query)).sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt))
}

export async function getContactById(id: string): Promise<Contact | null> {
  await delay(150)
  return contacts.find((contact) => contact.id === id) ?? null
}

/** Synchronous lookup for cross-referencing (e.g. showing a contact's name on an opportunity/visit card) without an async round-trip. */
export function findContactSync(id: string): Contact | undefined {
  return contacts.find((contact) => contact.id === id)
}

export function findContactByPhone(phone: string): Contact | undefined {
  return contacts.find((contact) => contact.phone === phone)
}

export function findDuplicateContact(phone: string, email: string, excludeId?: string): Contact | null {
  return (
    contacts.find(
      (contact) => contact.id !== excludeId && (contact.phone === phone || contact.email.toLowerCase() === email.toLowerCase()),
    ) ?? null
  )
}

export async function createContact(input: ContactInput): Promise<Contact> {
  await delay(200)
  const now = new Date().toISOString()
  const contact: Contact = {
    id: `contact-${Date.now()}`,
    organizationId: 'org-fl',
    ...input,
    lastActivityAt: now,
    createdAt: now,
    updatedAt: now,
  }
  contacts = [contact, ...contacts]
  saveContacts()
  return contact
}

export async function updateContact(id: string, input: Partial<ContactInput>): Promise<Contact> {
  await delay(200)
  const now = new Date().toISOString()
  contacts = contacts.map((contact) => (contact.id === id ? { ...contact, ...input, updatedAt: now } : contact))
  saveContacts()
  return contacts.find((contact) => contact.id === id)!
}

export function getContactNotes(contactId: string): ContactNote[] {
  return notes.filter((note) => note.contactId === contactId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function addContactNote(contactId: string, authorUserId: string, text: string): Promise<ContactNote> {
  await delay(150)
  const now = new Date().toISOString()
  const note: ContactNote = { id: `note-${Date.now()}`, contactId, authorUserId, text, createdAt: now }
  notes = [note, ...notes]
  saveNotes()
  contacts = contacts.map((contact) => (contact.id === contactId ? { ...contact, lastActivityAt: now } : contact))
  saveContacts()
  return note
}
