export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqCategory {
  id: string;
  name: string;
  faqs: FaqItem[];
}

export const faqData: FaqCategory[] = [
  {
    id: 'account',
    name: 'Account',
    faqs: [
      {
        id: 'acc-1',
        question: 'How do I change the password for my account?',
        answer: "You can change your password by navigating to the 'Account' page, then clicking on the 'Change Password' tab. From there, you will find the 'Password' field where you can enter your current and new password. Make sure to click the 'Update Changes' button to save your changes before leaving the page."
      },
      {
        id: 'acc-2',
        question: 'How do I update my profile information?',
        answer: "To update your profile information, such as your name or email, please go to the 'Account' page. Click the 'Profile' tab, you can simply edit your information there and be sure to click 'Edit' button to save them before you leave the page."
      },
      {
        id: 'acc-3',
        question: 'Can I change the email address associated with my account?',
        answer: "Yes. In the 'Account' page, you can find the option to update your email address." 
      },
      {
        id: 'acc-4',
        question: 'How do I delete my account?',
        answer: "To permanently delete your account, please go to Account > Profile. At the bottom of the page, you'll find the 'Delete Account' field. Fill in the required information and confirm your decision. Please be aware that this action is irreversible."
      },
      {
        id: 'acc-5',
        question: 'What should I do if I forget my password?',
        answer: "If you've forgotten your password, please click the 'Forgot Password?' link on the login page. You will be prompted to enter the email address associated with your account. Answer the security question you set up during registration, and then you'll receive an email with instructions to reset your password."
      },
      {
        id: 'acc-6',
        question: 'How do I log out of my account?',
        answer: "To log out of your account, simply click on the 'Logout' button located in the sidebar menu. This will securely log you out and redirect you to the login page."
      }
    ]
  },
    {
    id: 'dashboard',
    name: 'Dashboard',
    faqs: [
      {
        id: 'dash-1',
        question: 'How often are the dashboards data updated?',
        answer: 'The dashboard data is updated in near real-time. Any new sales data you add should be reflected in the dashboard metrics within a few minutes.'
      },
      {
        id: 'dash-2',
        question: '[Sales Overview] What is the purpose of this dashboard?',
        answer: 'The dashboard provides a high-level overview of your sales activity. It includes key metrics such as total sales, total number of orders, total number of customers, and charts showing sales trends over time.'
      },
      {
        id: 'dash-3',
        question: '[Sales Overview] Can I filter the data on my dashboard?',
        answer: 'You can filter the dashboard data by a specific date range or product category. Look for the date picker at the top of the page to select date ranges or drop down to select product categories.'
      },
      {
        id: 'dash-4',
        question: '[Performance & Market Basket] What does this dashboard show?',
        answer: 'This dashboard helps you understand customer purchasing patterns by identifying which products are frequently bought together in the same transaction. This is useful for product bundling, store layout, and cross-selling promotions.'
      },
      {
        id: 'dash-5',
        question: '[Performance & Market Basket] How do I see the performance of a specific product?',
        answer: 'You can use the filters to select a specific product or product category. The charts will then update to show detailed performance metrics like sales volume, revenue, and profit margins for your selection. The dashboard also provides top 10 most sold products and top 10 least sold products for quick insights.'
      },
      {
        id: 'dash-6',
        question: '[Customer Behavior & Trends] What insights can I find here?',
        answer: 'The Customer Behavior section provides insights into customer order channel, purchasing frequency, churn rate and so on. You can use this information to tailor your marketing strategies and improve customer retention.'
      },
      {
        id: 'dash-7',
        question: '[What-If Analysis] What is this dashboard for?',
        answer: 'The What-If Analysis dashboard allows you to simulate different business scenarios by adjusting key variables. This helps you understand the potential impact on your profitability and make informed decisions.'
      },
      {
        id: 'dash-8',
        question: '[What-If Analysis] Are the scenarios I create saved?',
        answer: 'No, the scenarios you create in the What-If Analysis dashboard are not saved. Each time you visit the dashboard, you will start with the default values. If you want to keep a record of your scenarios, consider taking screenshots or noting down the parameters you used.'
      }
    ]
  },
  {
    id: 'user-management',
    name: 'User Management',
    faqs: [
      {
        id: 'um-1',
        question: 'How do I add a new user to the system?',
        answer: "To add a new user, navigate to the 'User Management' page from the sidebar and click the 'Add User' button. You'll need to provide their name, email address, password, and assign them a user role. Once you've filled in the details, click 'Add User' to add them to the system."
      },
      {
        id: 'um-2',
        question: 'What are the different user roles?',
        answer: "The system has different user roles, such as 'Admin' and 'Staff'. Admins have full access to all features, including the user management, while Staff members have restricted access focused on managing sales data only."
      },
      {
        id: 'um-3',
        question: 'How can I edit or remove an existing user?',
        answer: "On the 'User Management' page, find the user you wish to modify in the list. Click the checkbox next to it and click the 'Edit User' button to update their details or role, or click the 'Delete User' button to remove their access from the system."
      },
      {
        id: 'um-4',
        question: 'What should I do if a user forgets their password?',
        answer: "If a user forgets their password, they can use the 'Forgot Password?' link on the login page to reset it. They will need to enter their registered email address and answer their security question to receive a password reset link."
      }
    ]
  },
  {
    id: 'order-records',
    name: 'Order Records',
    faqs: [
      {
        id: 'add-1',
        question: 'What is the step-by-step process for adding a new order transaction?',
        answer: "To create a new order, first navigate to the 'Sales Data' page from the sidebar and click the 'Add Record' button. You will then be prompted to fill in customer order details, order items, and review the information before confirming."
      },
      {
        id: 'add-2',
        question: 'Can I edit an order record?',
        answer: "You can edit an order as long as it is in the 'Sales Data' page. Locate the order you wish to modify, click the checkbox beside it, and click the 'Edit' button. Make the necessary changes and ensure to save them by clicking the 'Update Changes' button before exiting."
      },
      {
        id: 'add-3',
        question: 'How do I delete an order record?',
        answer: "Currently, archiving a record is only possible. To archive an order, go to the 'Sales Data' page and find the order you want to remove. Click the checkbox next to the order and click the 'Archive Record' button."
      },
      {
        id: 'add-4',
        question: 'How can I view archived orders?',
        answer: "To view archived orders, simply navigate to the 'Archive Data' page. This will display a list of all archived orders. You can restore an archived order by selecting it and clicking the 'Restore' button."
      },
      {
        id: 'add-5',
        question: 'Is it possible to restore an archived order?',
        answer: "Yes, you can restore an archived order. Go to the 'Archive Data' page, select the order you wish to restore by clicking the checkbox next to it, and then click the 'Restore' button. The order will be moved back to the 'Sales Data' page."
      },
      {
        id: 'add-6',
        question: 'How do I search for a specific order record?',
        answer: "To search for a specific order, use the search bar located at the top of the 'Sales Data' page. You can enter keywords such as customer name, time, date, and so on to quickly find the order you're looking for."
      },
      {
        id: 'add-7',
        question: 'What should I do if I encounter an error while adding or editing an order?',
        answer: "If you encounter an error while adding or editing an order, please double-check the information you've entered to ensure all required fields are filled out correctly. If the problem persists, try refreshing the page or logging out and back in."
      }
    ]
  },
  {
    id: 'technical',
    name: 'Technical',
    faqs: [
      {
        id: 'tech-1',
        question: 'The application is running slow. What can I do?',
        answer: "If you're experiencing slowness, please try clearing your browser's cache and cookies first. Also, ensure you have a stable internet connection. If the issue persists, try restarting your browser or using a different one. "
      },
      {
        id: 'tech-2',
        question: 'I am having trouble logging in. What should I do?',
        answer: "If you're having trouble logging in, please first ensure that you're using the correct email and password. If you've forgotten your password, click the 'Forgot Password?' link on the login page to reset it. If you continue to experience issues, try clearing your browser's cache and cookies or using a different browser."
      },
      {
        id: 'tech-3',
        question: 'The application is not displaying correctly. How can I fix this?',
        answer: "If the application is not displaying correctly, please try refreshing the page. If that doesn't work, clear your browser's cache and cookies. Additionally, ensure that your browser is up to date."
      },
      {
        id: 'tech-4',
        question: 'I am experiencing frequent crashes. What should I do?',
        answer: "If you're experiencing frequent crashes, please try clearing your browser's cache and cookies first. Also, ensure that your browser is up to date. If the issue persists, try using a different browser or restarting your device."
      }
    ]
  }
];