// Cleanup script to remove duplicate messages
// Run this once to clean up existing duplicate data

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicateMessages() {
  try {
    // Find conversations with duplicate messages
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    for (const conversation of conversations) {
      const messages = conversation.messages;
      const seen = new Set();
      const duplicates = [];

      for (const message of messages) {
        const key = `${message.role}-${message.content}`;
        if (seen.has(key)) {
          duplicates.push(message.id);
        } else {
          seen.add(key);
        }
      }

      if (duplicates.length > 0) {
        console.log(`Removing ${duplicates.length} duplicate messages from conversation ${conversation.id}`);
        await prisma.message.deleteMany({
          where: {
            id: {
              in: duplicates
            }
          }
        });
      }
    }

    console.log('Cleanup completed!');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateMessages();
