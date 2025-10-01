import { Search } from "lucide-react"
import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { faqData } from "../assets/faqData"
import type { FaqCategory } from "../assets/faqData"
import { Accordion, AccordionDetails, AccordionSummary, Tabs, Tab, Typography, Box } from "@mui/material"
import ExpandMore from "@mui/icons-material/ExpandMore"
import "../css/NeedHelp.css"

export default function NeedHelpPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [expandedQuestion, setExpandedQuestion] = useState<string | false>(false)

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    setExpandedQuestion(false)
  }

  const currentCategory: FaqCategory = faqData[activeTab]

  return (
    <div className="needhelp-container">
      <div className="needhelp-header">
        <Link to="/">
          <span>KC&apos;s Kitchen</span>
        </Link>
      </div>

      <div className="help-content">
        <div className="top-content">
          <h1>HELP CENTER</h1>
          <p>Find answers to your questions and get the help you need</p>
          <div className="search-bar">
            <Search className="search-icon" />
            <input type="text" placeholder="Search for tutorials and explanations....." />
          </div>
        </div>

        <div className="nav-faqs">
          <h2>Frequently Asked Questions</h2>

          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs className="category-tabs" value={activeTab} onChange={handleTabChange}>
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
              onChange={() => setExpandedQuestion(expandedQuestion === faq.id ? false : faq.id)}
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
        </div>
      </div>
    </div>
  )
}
