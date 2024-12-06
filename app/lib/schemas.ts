import { z } from "zod"

export const experienceSchema = z.object({
    title: z.string(),
    company: z.string(),
    location: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    description: z.array(z.string()),
    tags: z.array(z.string()).optional(),
    logo: z.string().optional(),
})

export const careerSchema = z.object({
    career: z.array(experienceSchema),
})

export const educationSchema = z.object({
    education: z.array(experienceSchema),
})

export type Experience = z.infer<typeof experienceSchema> 