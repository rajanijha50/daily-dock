const QUOTES_API = process.env.NEXT_PUBLIC_QUOTES

export async function GetQuote() {
    // const url = `https://api.api-ninjas.com/v2/randomquotes`
    const url = `https://api.api-ninjas.com/v2/quoteoftheday`
    try {
        const res = await fetch(url, {
            headers: { 'X-Api-Key': `${QUOTES_API}` }
        })
        const data = await res.json()
        // console.log(data)
        return data
    } catch (error) {
        console.error("Error in Quotes", error)

    }
}