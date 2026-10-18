import { motion } from 'motion/react'
import { animated } from '@react-spring/web'
import { motion as framerMotion } from 'framer-motion'
import { animate } from 'motion'
import { useSpring } from 'react-spring'
import { useMotionPreference } from '@/anim/useMotionPreference'
import { TextEffect } from '@/components/motion-primitives/text-effect'
import { hero } from '@/content'
const dynamicMotion = import('motion/react')
import { ThemeThumb } from '@/anim'
export { useScroll } from 'motion/react'
import { deepThumb } from '@/anim/physics/ThemeThumb'
import { deepPrimitive } from '@/components/motion-primitives/nested/deep'
import { deepContent } from '@/content/projects/data'
import { deepSpring } from '@react-spring/web/nested/deep'

export const used = [
  motion,
  animated,
  framerMotion,
  animate,
  useSpring,
  useMotionPreference,
  TextEffect,
  hero,
  dynamicMotion,
  ThemeThumb,
  deepThumb,
  deepPrimitive,
  deepContent,
  deepSpring,
]
