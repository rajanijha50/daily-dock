"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GetQuote } from "./handler/quote";


const Quote = () => {
  const [quoteText, setQuoteText] = useState<string>(
    "",
  );
  const [quoteAuthor, setQuoteAuthor] = useState<string>("");
  const [quoteCategory, setQuoteCategory] = useState<string[]>();

  async function fetchData() {
    const data = await GetQuote();
    if (data && data[0].length !== 0) {
      setQuoteText(data[0].quote);
      setQuoteAuthor(data[0].author);
      setQuoteCategory(data[0].category);
    }
  }
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <Card className="text-primary dark:text-foreground w-full max-w-4xl mx-auto backdrop-blur-xl bg-linear-to-br from-muted to-card-foreground dark:from-muted dark:to-primary-foreground border-white/30 shadow-2xl overflow-hidden"> 
      <CardHeader>
        <CardTitle className="w-full text-3xl">Quote of the Day</CardTitle>
      </CardHeader>
      <CardContent className="w-full flex flex-col">
        {quoteText && quoteAuthor ? (
          <>
            <span className="text-lg italic mb-2">"{quoteText}"</span>
            <div className="text-sm text-right">— {quoteAuthor}</div>
          </>
        ) : (
          <>
            <div className="bg-white/20 w-full h-20 rounded-2xl animate-pulse" />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Quote;
