import { useEffect } from "react";
import "../css/Help.css";
import Sidebar from "../components/Sidebar";
import { Search } from "lucide-react";
import { Box } from "@mui/material";
import React, { useState } from "react";
import { faqData } from "../assets/faqData";
import type { FaqCategory, FaqItem } from "../assets/faqData";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Tabs,
  Tab,
  Typography
} from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";

interface HelpProps {
  onLogout?: () => void;
}

const Help: React.FC<HelpProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedQuestion, setExpandedQuestion] = useState<string | false>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState<FaqItem[]>([]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFaqs([]);
      return;
    }

    const allFaqs = faqData.flatMap(category => category.faqs);
    const results = allFaqs.filter(
      faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFaqs(results);
    setExpandedQuestion(false); // Collapse all questions when searching
  }, [searchQuery]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setExpandedQuestion(false);
  };

  const currentCategory: FaqCategory = faqData[activeTab];

  return (
    <div className="help-container">
      <Sidebar onLogout={onLogout} />
      <div className="help-content">
        <div className="top-content">
          <h1>HELP CENTER</h1>
          <p>Find answers to your questions and get the help you need</p>
          <div className="search-bar-container">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Search for tutorials and explanations....." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="nav-faqs">
          {searchQuery.trim() === "" ? (
            <>
              <h2>Frequently Asked Questions</h2>

              <Box className="nav-box" sx={{ borderBottom: 1, borderColor: "divider", mb: 2}}>
                <Tabs
                  className="category-tabs"
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTabs-flexContainer': {
                      justifyContent: 'space-between'
                    },
                  }}
                >
                  {faqData.map((category) => (
                    <Tab key={category.id} label={category.name} />
                  ))}
                </Tabs>
              </Box>

              {currentCategory.faqs.map((faq, index) => (
                <Accordion
                  style={{ borderRadius: "10px", marginBottom: "10px" }}
                  key={faq.id}
                  expanded={expandedQuestion === faq.id}
                  onChange={() =>
                    setExpandedQuestion(expandedQuestion === faq.id ? false : faq.id)
                  }
                >
                  <AccordionSummary
                    style={{ borderRadius: "10px" }}  
                    expandIcon={<ExpandMore />}
                    aria-controls={`panel${index}-content`}
                    id={`panel${index}-header`}
                  >
                    <Typography>{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>{faq.answer}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </>
          ) : (
            <>
              <h2>Search Results for "{searchQuery}"</h2>
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => (
                  <Accordion
                    style={{ borderRadius: "10px", marginBottom: "10px" }}
                    key={faq.id}
                    expanded={expandedQuestion === faq.id}
                    onChange={() =>
                      setExpandedQuestion(expandedQuestion === faq.id ? false : faq.id)
                    }
                  >
                    <AccordionSummary
                      style={{ borderRadius: "10px" }}
                      expandIcon={<ExpandMore />}
                      aria-controls={`panel${index}-content`}
                      id={`panel${index}-header`}
                    >
                      <Typography>{faq.question}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography>{faq.answer}</Typography>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Typography>No results found. Please try another search term.</Typography>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Help;