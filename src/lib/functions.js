import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend';

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.SUPABASE_PROJECT_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE
const supabase = createClient(supabaseUrl, supabaseKey)
const apikey = process.env.GNEWS_API_KEY
const resend = new Resend(process.env.RESEND_API_KEY)

export async function addUser(email_addr, user_name, user_interests) {
    const {data, error} = await supabase.from('users').insert({ email: email_addr, name: user_name, interests: user_interests })
    if(error){
        return { success: false, error: error.message }
    }
    return { success: true, data }
}

export async function getActiveUsers() {
    const {data, error} = await supabase.from('users').select('email,name,interests,active').eq('active', true)
    if(error){
        return { success: false, error: error.message }
    }
    return { success: true, data }
}

export async function fetchArticles(interests){
    // Calculate last 24 hours in the correct format
    const last24hrs = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    let allArticles = [] // Store all articles from all interests
    // For each interest keyword lets fetch 2 articles
    for(let i = 0; i < interests.length; i++){
        const url = `https://gnews.io/api/v4/search?q=${interests[i]}&apikey=${apikey}&from=${last24hrs}&max=2&sortby=relevance`
        try {
            const response = await fetch(url)
            const data = await response.json()  
            if(data.articles && data.articles.length > 0) {
                // Extract title and url from each article
                for(let count = 0; count < data.articles.length; count++){
                    allArticles.push({
                        title: data.articles[count].title,
                        url: data.articles[count].url,
                        interest: interests[i] // Track which interest this article is for
                    })
                }
            }
        } catch (error) {
            console.log(`Error fetching news for ${interests[i]}:`, error)
        }
    }
    return allArticles // Returns array of {title, url, interest} objects
}

export async function sendEmail(articles, email, userName) {
    // Create HTML content from articles
    if(articles.length>0){
        let emailContent = `<h2>Hi ${userName}!</h2><p>Here's your daily news digest:</p><br>`
    
        // Group articles by interest for better formatting
        const groupedArticles = {}
        articles.forEach(article => {
            if (!groupedArticles[article.interest]) {
                groupedArticles[article.interest] = []
            }
            groupedArticles[article.interest].push(article)
        })
        
        // Format each interest section
        for (const [interest, articleList] of Object.entries(groupedArticles)) {
            emailContent += `<h3>${interest.toUpperCase()}</h3><ul>`
            articleList.forEach(article => {
                emailContent += `<li><a href="${article.url}" target="_blank">${article.title}</a></li>`
            })
            emailContent += '</ul><br>'
        }
        emailContent += `<p>Happy reading!</p>`

        try {
            const { data, error } = await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: [email],
                subject: 'Your Daily News Digest',
                html: emailContent
            });
            if (error){
                return { success: false, error: error.message }
            }
            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }
    else{
        return {success: false, error:"No articles to send"}
    }
}