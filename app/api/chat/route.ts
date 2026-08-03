import { NextResponse } from 'next/server'
import { ClientSecretCredential, DefaultAzureCredential } from '@azure/identity'
import { AIProjectClient } from '@azure/ai-projects'

export const maxDuration = 60
export const runtime = 'nodejs'

const endpoint =
    process.env.AZURE_AI_PROJECT_ENDPOINT ??
    'https://foundryprojectoscar.services.ai.azure.com/api/projects/proj-default'

const agentName = process.env.AZURE_AI_AGENT_NAME ?? 'Personalegent-new'
const agentVersion = process.env.AZURE_AI_AGENT_VERSION ?? '4'

function getCredential() {
    const tenantId = process.env.AZURE_TENANT_ID
    const clientId = process.env.AZURE_CLIENT_ID
    const clientSecret = process.env.AZURE_CLIENT_SECRET

    if (tenantId && clientId && clientSecret) {
        return new ClientSecretCredential(tenantId, clientId, clientSecret)
    }

    return new DefaultAzureCredential()
}

const projectClient = new AIProjectClient(endpoint, getCredential())

/** Strip RAG citation markers like 【8:0†source】 from agent output. */
function stripCitations(text: string | null | undefined): string {
    if (!text) return ''
    return text
        .replace(/【\d+:\d+†[^】]*】/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim()
}

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
                message: stripCitations(response.output_text),
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
            message: stripCitations(response.output_text),
            conversationId: activeConversationId,
        })
    } catch (error) {
        console.error('Azure AI agent error:', error)
        const message =
            error instanceof Error ? error.message : 'Internal Server Error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
