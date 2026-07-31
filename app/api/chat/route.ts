import { NextResponse } from 'next/server'
import { DefaultAzureCredential } from '@azure/identity'
import { AIProjectClient } from '@azure/ai-projects'

const endpoint =
    process.env.AZURE_AI_PROJECT_ENDPOINT ??
    'https://foundryprojectoscar.services.ai.azure.com/api/projects/proj-default'

const agentName = process.env.AZURE_AI_AGENT_NAME ?? 'Personalegent-new'
const agentVersion = process.env.AZURE_AI_AGENT_VERSION ?? '4'

const projectClient = new AIProjectClient(endpoint, new DefaultAzureCredential())

export async function POST(req: Request) {
    try {
        const { message, conversationId } = await req.json()

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

        const openAIClient = projectClient.getOpenAIClient()
        const agentRef = {
            body: {
                agent_reference: {
                    name: agentName,
                    version: agentVersion,
                    type: 'agent_reference' as const,
                },
            },
        }

        let activeConversationId = conversationId as string | undefined

        if (!activeConversationId) {
            const conversation = await openAIClient.conversations.create({
                items: [{ type: 'message', role: 'user', content: message }],
            })
            activeConversationId = conversation.id

            const response = await openAIClient.responses.create(
                { conversation: activeConversationId },
                agentRef
            )

            return NextResponse.json({
                message: response.output_text,
                conversationId: activeConversationId,
            })
        }

        const response = await openAIClient.responses.create(
            {
                conversation: activeConversationId,
                input: message,
            },
            agentRef
        )

        return NextResponse.json({
            message: response.output_text,
            conversationId: activeConversationId,
        })
    } catch (error) {
        console.error('Azure AI agent error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
