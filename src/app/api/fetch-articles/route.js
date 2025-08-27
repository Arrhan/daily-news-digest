import * as functions from '../../../lib/functions'

export async function GET() {
  // 1. Get all users from database
  const result = await functions.getActiveUsers()
  if(result.success){
    // 2. For each user, fetch news based on their interests
    for(let i=0;i<result.data.length;i++){
      console.log(`Processing user: ${result.data[i].name}`)
      const articles = await functions.fetchArticles(result.data[i].interests)
      console.log(`Fetched ${articles.length} articles`)
      // 3. Send personalized emails
      const return_value = await functions.sendEmail(articles,result.data[i].email,result.data[i].name)
      // 4. Log the results
      if(return_value.success){
        // Add logging logic later
      }
      console.log(`Sent email to ${result.data[i].name}`)
    }
    return Response.json({ success: true, message: "Digest processing complete" })
  } else {
    return Response.json({ success: false, error: result.error })
  }
}