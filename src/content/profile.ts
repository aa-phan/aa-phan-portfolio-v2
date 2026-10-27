import { aboutPhoto } from './images'
import type { Profile } from './schema'

export const profile = {
  name: 'Aaron Phan',
  tagline: 'Software engineer building cloud-native backends in Go.',
  heroFacts: ['Graduating December 2026, UT Austin ECE', 'Last role: Capital One, summer 2026'],
  bio: [
    'Hello there! My name is Aaron Phan, and I’m a software engineer by day, and aspiring artist by night.',
    'In my spare time, I enjoy listening to EDM, cooking, and DJing under the pseudonym PHVNTM.',
  ],
  photo: aboutPhoto,
} as const satisfies Profile
