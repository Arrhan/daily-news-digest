import { addUser } from '../../../lib/functions'

export async function POST(request) {
    // 1. Get data from request
    const { email, name, interests } = await request.json()
    // 2. Call your database function
    const result = await addUser(email, name, interests)
    // 3. Send response back
    return Response.json(result)
}