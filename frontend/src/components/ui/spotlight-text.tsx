'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useSpring, useTransform, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SpotlightTextProps {
    text: string
    className?: string
    spotlightColor?: string
}

export function SpotlightText({ text, className, spotlightColor = 'rgba(255, 255, 255, 0.25)' }: SpotlightTextProps) {
    const ref = useRef<HTMLHeadingElement>(null)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const hovering = useMotionValue(0)

    // Smooth out the mouse movement
    const springConfig = { damping: 25, stiffness: 300 }
    const springX = useSpring(mouseX, springConfig)
    const springY = useSpring(mouseY, springConfig)

    // 3D Tilt Effect based on mouse position
    const rotateX = useTransform(springY, [-0.5, 0.5], ["15deg", "-15deg"])
    const rotateY = useTransform(springX, [-0.5, 0.5], ["-15deg", "15deg"])

    // Internal Glow Gradient
    const spotlightGradient = useMotionTemplate`radial-gradient(
        circle 150px at ${useTransform(springX, (x) => `${x * 100 + 50}%`)} ${useTransform(springY, (y) => `${y * 100 + 50}%`)}, 
        ${spotlightColor}, 
        transparent 80%
    )`

    function onMouseEnter() {
        hovering.set(1)
    }

    function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect()
        const x = (clientX - left) / width - 0.5
        const y = (clientY - top) / height - 0.5
        mouseX.set(x)
        mouseY.set(y)
    }

    function onMouseLeave() {
        mouseX.set(0)
        mouseY.set(0)
        hovering.set(0)
    }

    return (
        <motion.div
            className={cn("relative perspective-1000 inline-block cursor-default select-none py-4 px-8 -mx-8 sm:py-8 sm:px-12 sm:-mx-12", className)}
            onMouseEnter={onMouseEnter}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={{
                perspective: "1000px",
            }}
        >
            <motion.h1
                ref={ref}
                className="relative font-bold tracking-tighter leading-none text-transparent bg-clip-text"
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                    backgroundImage: "linear-gradient(to bottom, white, rgba(255,255,255,0.5))",
                }}
            >
                {/* Base Text */}
                <span className="block relative z-10">{text}</span>

                {/* The Glow Effect - Applied to Text via background-clip */}
                <motion.span
                    className="absolute inset-0 block text-transparent bg-clip-text z-20 mix-blend-overlay pointer-events-none"
                    style={{
                        backgroundImage: spotlightGradient,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                    }}
                    aria-hidden="true"
                >
                    {text}
                </motion.span>

                {/* Firefly Particles */}
                <AnimatePresence>
                    {[...Array(3)].map((_, i) => (
                        <Firefly
                            key={i}
                            hovering={hovering}
                            mouseX={mouseX}
                            mouseY={mouseY}
                            index={i}
                        />
                    ))}
                </AnimatePresence>

            </motion.h1>
        </motion.div>
    )
}

function Firefly({ hovering, mouseX, mouseY, index }: { hovering: any, mouseX: any, mouseY: any, index: number }) {
    // Random offset for each firefly
    const randomDelay = Math.random() * 2

    return (
        <motion.div
            className="absolute w-2 h-2 bg-white rounded-full blur-[1px] pointer-events-none z-30 opacity-0"
            style={{
                top: "50%",
                left: "50%",
                x: useTransform(mouseX, (x: number) => x * 400 + (index - 1) * 40), // Move slightly offset from cursor
                y: useTransform(mouseY, (y: number) => y * 200 + (index - 1) * 20),
            }}
            animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                delay: randomDelay,
                ease: "easeInOut"
            }}
        />
    )
}
