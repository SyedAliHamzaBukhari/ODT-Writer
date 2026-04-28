import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create or get test user
  const hashedPassword = await bcrypt.hash('password123', 12)

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: hashedPassword,
    },
  })

  console.log(`Test user created/found: ${user.email}`)

  // Create first document with underlined letters
  const doc1 = await prisma.document.upsert({
    where: { id: 'doc-underlined-test' },
    update: {},
    create: {
      id: 'doc-underlined-test',
      userId: user.id,
      title: 'Underlined Text Demo',
      content: `<h1>Underlined Text Demo</h1>
<p>This is a test document demonstrating <u>underlined text</u> formatting.</p>
<p>Here are some examples:</p>
<ul>
<li>This word is <u>underlined</u> for emphasis</li>
<li>You can underline <u>multiple words</u> in a sentence</li>
<li><u>Entire sentences</u> can be underlined too</li>
<li>Combine formatting: <strong><u>bold and underlined</u></strong></li>
</ul>
<p>Underlined text is commonly used for:</p>
<ol>
<li>Book titles and publications</li>
<li>Emphasizing key points</li>
<li>Creating visual hierarchy</li>
<li>Highlighting important terms</li>
</ol>`,
    },
  })

  console.log(`Created document 1: ${doc1.title}`)

  // Create second document with bold text
  const doc2 = await prisma.document.upsert({
    where: { id: 'doc-bold-test' },
    update: {},
    create: {
      id: 'doc-bold-test',
      userId: user.id,
      title: 'Bold Text Demo',
      content: `<h1>Bold Text Demo</h1>
<p>This is a test document demonstrating <strong>bold text</strong> formatting.</p>
<p>Here are some examples:</p>
<ul>
<li>This word is <strong>bold</strong> for emphasis</li>
<li>You can make <strong>multiple words</strong> bold</li>
<li><strong>Entire sentences</strong> can be bold too</li>
<li>Combine formatting: <strong><u>bold and underlined</u></strong></li>
</ul>
<p>Bold text is commonly used for:</p>
<ol>
<li><strong>Headings and titles</strong></li>
<li><strong>Emphasizing key points</strong></li>
<li><strong>Creating visual hierarchy</strong></li>
<li><strong>Highlighting important terms</strong></li>
</ol>
<p>Bold text helps <strong>draw attention</strong> to important information and improves <strong>readability</strong> in your documents.</p>`,
    },
  })

  console.log(`Created document 2: ${doc2.title}`)

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
