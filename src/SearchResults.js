import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import { db } from "./firebaseConfig";
import "./style/SearchResults.css";

const SearchResults = () => {
  const location = useLocation();
  const [shoes, setShoes] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayedQuery, setDisplayedQuery] = useState("");
  const query = new URLSearchParams(location.search).get("q") || "";

  const fetchShoes = async () => {
    setIsLoading(true);
    const shoesCollection = collection(db, "shoes");
    const shoesSnapshot = await getDocs(shoesCollection);
    const shoesList = shoesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setShoes(shoesList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchShoes();
  }, []);

  useEffect(() => {
    if (shoes.length > 0) {
      const normalizedQuery = query.trim().replace(/\s+/g, " ").toLowerCase();
      let results = shoes;
      let updatedQuery = normalizedQuery;

      if (["men", "man"].includes(normalizedQuery)) {
        results = shoes.filter((shoe) => shoe.gender.toLowerCase() === "men");
      } else if (["women", "woman"].includes(normalizedQuery)) {
        results = shoes.filter((shoe) => shoe.gender.toLowerCase() === "women");
      } else if (["boy", "boys", "girl", "girls"].includes(normalizedQuery)) {
        results = shoes.filter((shoe) => shoe.gender.toLowerCase() === "kids");
        updatedQuery = "kids";
      } else {
        results = shoes.filter(
          (shoe) =>
            shoe.caption.toLowerCase().includes(normalizedQuery) ||
            shoe.description.toLowerCase().includes(normalizedQuery) ||
            shoe.category.toLowerCase().includes(normalizedQuery) ||
            shoe.gender.toLowerCase().includes(normalizedQuery)
        );
      }
      setFilteredResults(results);
      setDisplayedQuery(updatedQuery);
    }
  }, [query, shoes]);

  if (isLoading) {
    return (
      <div className="result-page">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (filteredResults.length === 0) {
    return (
      <div className="result-page">
        <h2>No results found for "{displayedQuery}". Please try again.</h2>
      </div>
    );
  }

  return (
    <div className="result-page">
      <h2>
        Search Results for <br /> "{displayedQuery}"
      </h2>
      <div className="results-container">
        {filteredResults.map((result) => (
          <div key={result.id} className="shoe-card">
            <img src={result.link} alt={result.caption} />
            <h3>{result.caption}</h3>
            <p>{result.description}</p>
            <p>{result.gender}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
