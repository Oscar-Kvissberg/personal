import { z } from 'zod'

export const experienceSchema = z.object({
    title: z.string(),
    company: z.string(),
    location: z.string(),
    description: z.array(z.string()),
    startDate: z.string(),
    endDate: z.string().optional(),
    tags: z.array(z.string()).optional(),
    logo: z.string().optional()
})

export type Experience = z.infer<typeof experienceSchema> 