export const MenuList = [
  //Dashboard
  {
    title: "Master",
    translationKey: "menu.master",
    iconStyle: <i className="flaticon-layout"></i>,
    to: "master",
  },
  {
    title: "Growth Center",
    translationKey: "menu.overview",
    iconStyle: <i className="flaticon-content"></i>,
    to: "overview",
  },
  {
    title: "Sales & Reports",
    translationKey: "menu.sales_reports",
    iconStyle: <i className="flaticon-statistics"></i>,
    to: "sales",
  },
  {
    title: "Order",
    translationKey: "menu.order",
    classsChange: "mm-collapse",
    iconStyle: <i className="flaticon-table"></i>,
    content: [
      {
        title: "Incoming Orders",
        translationKey: "menu.incoming_orders",
        to: "incoming-order",
      },
      // {
      //     title: 'Schedule Order',
      //     to: 'schedule-order',
      // },
      {
        title: "All Orders",
        translationKey: "menu.all_orders",
        to: "all-orders",
      },
    ],
  },

  {
    title: "Site Settings",
    translationKey: "menu.site_settings",
    classsChange: "mm-collapse",
    iconStyle: <i className="flaticon-network"></i>,
    content: [
      {
        title: "AI Website Builder",
        translationKey: "menu.ai_website_builder",
        to: "website-editing",
      },
      {
        title: "Domain Settings",
        translationKey: "menu.domain_settings",
        to: "custom-domains",
      },
      {
        title: "AI SEO Assistant",
        translationKey: "menu.ai_seo_assistant",
        to: "website-seo",
      },
      {
        title: "AI Assistant Settings",
        translationKey: "menu.ai_assistant_settings",
        to: "ai-settings",
      },
      {
        title: "Website Analytics",
        translationKey: "menu.website_analytics",
        to: "website-analytics",
      },
    ],
  },
  {
    title: "Menu",
    translationKey: "menu.menu_management",
    classsChange: "mm-collapse",
    iconStyle: <i className="flaticon-form"></i>,
    content: [
      {
        title: "All Products",
        translationKey: "menu.all_products",
        to: "all-products",
      },
      {
        title: "Categories",
        translationKey: "menu.categories",
        to: "product-category",
      },
      {
        title: "Modify",
        translationKey: "menu.modify",
        to: "attributes",
      },
      {
        title: "Special Modify",
        translationKey: "menu.special_modify",
        to: "special-attributes",
      },
      {
        title: "AI Menu Uploader",
        translationKey: "menu.ai_menu_uploader",
        to: "automated-menu",
      },
      {
        title: "Excel Menu Import",
        translationKey: "menu.excel_menu_import",
        to: "excel-menu-import",
      },
      {
        title: "Menu Tools",
        translationKey: "menu.menu_tools",
        to: "import-menu",
      },

    ],
  },
  {
    title: "Business Settings",
    translationKey: "menu.business_settings",
    classsChange: "mm-collapse",
    iconStyle: <i className="flaticon-home"></i>,
    content: [
      {
        title: "Online Fees & Charges",
        translationKey: "menu.online_fees_charges",
        to: "fees",
      },
      {
        title: "Regular Store Hours",
        translationKey: "menu.regular_store_hours",
        to: "online-status",
      },
      {
        title: "Special Store Hours",
        translationKey: "menu.special_store_hours",
        to: "special-hours",
      },
      {
        title: "Business Info",
        translationKey: "menu.business_info",
        to: "business-setting",
      },
      {
        title: "SMS Notification",
        translationKey: "menu.sms_notification",
        to: "sms-notification",
      },
      {
        title: "Printers",
        translationKey: "menu.printers",
        to: "printers",
      },
      {
        title: "Legacy SMS Settings	",
        translationKey: "menu.legacy_sms_settings",
        to: "stop-order",
      },
    ],
  },
  {
    title: "Smart Marketing",
    translationKey: "menu.smart_marketing",
    classsChange: "mm-collapse",
    iconStyle: <i className="flaticon-star"></i>, // Suggests AI
    content: [
      {
        title: "Instagram Automation",
        translationKey: "menu.instagram_automation",
        to: `automated-instagram`,
      },
      {
        title: "Facebook Automation",
        translationKey: "menu.facebook_automation",
        to: `automated-facebook`,
      },
      {
        title: "SMS Campaigns",
        translationKey: "menu.sms_campaigns",
        to: "automated-sms",
      },
      {
        title: "Email Campaigns",
        translationKey: "menu.email_campaigns",
        to: "automated-email",
      },
      {
        title: "Marketing Autopilot",
        translationKey: "menu.marketing_autopilot",
        to: "automated-marketing",
      },
      {
        title: "Smart Media",
        translationKey: "menu.smart_media",
        to: "automated-gallery",
      },
    ],
  },
  {
    title: "Google Business",
    translationKey: "menu.google_business",
    iconStyle: <i className="flaticon-location"></i>,
    to: "google-business",
  },
  {
    title: "Upsell",
    translationKey: "menu.upsell",
    classsChange: "mm-collapse",
    iconStyle: <i className="flaticon-wallet"></i>,
    content: [
      {
        title: "Coupons",
        translationKey: "menu.coupons",
        to: "coupons",
      },
      {
        title: "Promotion & Rewards",
        translationKey: "menu.promotion_rewards",
        to: "promotion-rewards",
      },
      {
        title: "Special Items",
        translationKey: "menu.special_items",
        to: "special-items",
      },
      {
        title: "Order Upsell",
        translationKey: "menu.order_upsell",
        to: "item-upsell",
      },
      {
        title: "BOGO (Buy one get one)",
        translationKey: "menu.bogo",
        to: "bogo",
      },
   
    ],
  },
  // {
  //     title: 'Waitlist',
  //     iconStyle: <i className="flaticon-user"></i>,
  //     to: 'waitlist',
  // },

  {
    title: "Payments",
    translationKey: "menu.payments",
    classsChange: "mm-collapse",
    iconStyle: <i className="flaticon-cash"></i>,
    content: [
      {
        title: "Payment Setup",
        translationKey: "menu.payment_setup",
        to: "payment-onboarding",
      },
      {
        title: "Transactions",
        translationKey: "menu.transactions",
        to: "payments",
      },
      {
        title: "Documents",
        translationKey: "menu.documents",
        to: "documents",
      },
      {
        title: "Payouts",
        translationKey: "menu.payouts",
        to: "payout",
      },
      {
        title: "Payout & transfer log",
        translationKey: "menu.payout_transfer_log",
        to: "connect-payout-ledger",
      },
    ],
  },

  {
    title: "Customer",
    translationKey: "menu.customer",
    iconStyle: <i className="flaticon-user"></i>,
    to: "reward-customers",
  },

  {
    title: "Kiosks",
    translationKey: "menu.kiosks",
    iconStyle: <i className="flaticon-app"></i>,
    to: "kiosks",
  },

  {
    title: "POS Integration",
    translationKey: "menu.pos_integration",
    classsChange: "mm-collapse",
    iconStyle: <i className="flaticon-plugin"></i>,
    content: [
      {
        title: "Clover",
        translationKey: "menu.clover",
        to: "clover",
      },
    ],
  },

  {
    title: "Account & Support",
    translationKey: "menu.account_support",
    classsChange: "mm-collapse",
    iconStyle: <i className="flaticon-settings"></i>,
    content: [
      {
        title: "Account",
        translationKey: "menu.account",
        to: "account",
      },
      {
        title: "Transfer Restaurant Data",
        translationKey: "menu.transfer_restaurant_data",
        to: "transfer-restaurant-data",
      },
    ],
  },
  //Apps
  // {
  //     title: 'Apps',
  //     classsChange: 'mm-collapse',
  //     iconStyle: <i className="flaticon-app"></i>,
  //     content: [
  //         {
  //             title: 'Profile',
  //             to: 'app-profile'
  //         },

  //         {
  //             title: 'Post Details',
  //             to: 'post-details'
  //         },
  //         {
  //             title: 'Email',
  //             //to: './',
  //             hasMenu : true,
  //             content: [
  //                 {
  //                     title: 'Compose',
  //                     to: 'email-compose',
  //                 },
  //                 {
  //                     title: 'Index',
  //                     to: 'email-inbox',
  //                 },
  //                 {
  //                     title: 'Read',
  //                     to: 'email-read',
  //                 }
  //             ],
  //         },
  //         {
  //             title:'Calendar',
  //             to: 'app-calender'
  //         },
  //         {
  //             title: 'Shop',
  //             //to: './',
  //             hasMenu : true,
  //             content: [
  //                 {
  //                     title: 'Product Grid',
  //                     to: 'ecom-product-grid',
  //                 },
  //                 {
  //                     title: 'Product List',
  //                     to: 'ecom-product-list',
  //                 },
  //                 {
  //                     title: 'Product Details',
  //                     to: 'ecom-product-detail',
  //                 },
  //                 {
  //                     title: 'Order',
  //                     to: 'ecom-product-order',
  //                 },
  //                 {
  //                     title: 'Checkout',
  //                     to: 'ecom-checkout',
  //                 },
  //                 {
  //                     title: 'Invoice',
  //                     to: 'ecom-invoice',
  //                 },
  //                 {
  //                     title: 'Customers',
  //                     to: 'ecom-customers',
  //                 },
  //             ],
  //         },
  //     ],
  // },
  // //Charts
  // {
  //     title: 'Charts',
  //     classsChange: 'mm-collapse',
  //     iconStyle: <i className="flaticon-bar-chart-1"></i>,
  //     content: [

  //         {
  //             title: 'RechartJs',
  //             to: 'chart-rechart',
  //         },
  //         {
  //             title: 'Chartjs',
  //             to: 'chart-chartjs',
  //         },
  //         {
  //             title: 'Sparkline',
  //             to: 'chart-sparkline',
  //         },
  //         {
  //             title: 'Apexchart',
  //             to: 'chart-apexchart',
  //         },
  //     ]
  // },
  // //Boosttrap
  // {
  //     title: 'Bootstrap',
  //     classsChange: 'mm-collapse',
  //     iconStyle: <i className="flaticon-star"></i>,
  //     content: [
  //         {
  //             title: 'Accordion',
  //             to: 'ui-accordion',
  //         },
  //         {
  //             title: 'Alert',
  //             to: 'ui-alert',
  //         },
  //         {
  //             title: 'Badge',
  //             to: 'ui-badge',
  //         },
  //         {
  //             title: 'Button',
  //             to: 'ui-button',
  //         },
  //         {
  //             title: 'Modal',
  //             to: 'ui-modal',
  //         },
  //         {
  //             title: 'Button Group',
  //             to: 'ui-button-group',
  //         },
  //         {
  //             title: 'List Group',
  //             to: 'ui-list-group',
  //         },
  //         {
  //             title: 'Cards',
  //             to: 'ui-card',
  //         },
  //         {
  //             title: 'Carousel',
  //             to: 'ui-carousel',
  //         },
  //         {
  //             title: 'Dropdown',
  //             to: 'ui-dropdown',
  //         },
  //         {
  //             title: 'Popover',
  //             to: 'ui-popover',
  //         },
  //         {
  //             title: 'Progressbar',
  //             to: 'ui-progressbar',
  //         },
  //         {
  //             title: 'Tab',
  //             to: 'ui-tab',
  //         },
  //         {
  //             title: 'Typography',
  //             to: 'ui-typography',
  //         },
  //         {
  //             title: 'Pagination',
  //             to: 'ui-pagination',
  //         },
  //         {
  //             title: 'Grid',
  //             to: 'ui-grid',
  //         },
  //     ]
  // },
  // //plugins
  // {
  //     title:'Plugins',
  //     classsChange: 'mm-collapse',
  //     iconStyle : <i className="flaticon-plugin"></i>,
  //     content : [
  //         {
  //             title:'Select 2',
  //             to: 'uc-select2',
  //         },
  //         {
  //             title:'Sweet Alert',
  //             to: 'uc-sweetalert',
  //         },
  //         {
  //             title:'Toastr',
  //             to: 'uc-toastr',
  //         },
  //         {
  //             title:'Jqv Map',
  //             to: 'map-jqvmap',
  //         },
  //         {
  //             title:'Light Gallery',
  //             to: 'uc-lightgallery',
  //         },
  //     ]
  // },
  // //Widget
  // {
  //     title:'Widget',
  //     iconStyle: <i className="flaticon-network"></i>,
  //     to: 'widget-basic',
  // },
  // //Forms
  // {
  //     title:'Forms',
  //     classsChange: 'mm-collapse',
  //     iconStyle: <i className="flaticon-form"></i>,
  //     content : [
  //         {
  //             title:'Form Elements',
  //             to: 'form-element',
  //         },
  //         {
  //             title:'Wizard',
  //             to: 'form-wizard',
  //         },
  //         {
  //             title:'CkEditor',
  //             to: 'form-ckeditor',
  //         },
  //         {
  //             title:'Pickers',
  //             to: 'form-pickers',
  //         },
  //         {
  //             title:'Form Validate',
  //             to: 'form-validation',
  //         },

  //     ]
  // },
  // //Table
  // {
  //     title:'Table',
  //     classsChange: 'mm-collapse',
  //     iconStyle: <i className="flaticon-table"></i>,
  //     content : [
  //         {
  //             title:'Table Filtering',
  //             to: 'table-filtering',
  //         },
  //         {
  //             title:'Table Sorting',
  //             to: 'table-sorting',
  //         },
  //         {
  //             title:'Bootstrap',
  //             to: 'table-bootstrap-basic',
  //         },

  //     ]
  // },
  // //Pages
  // {
  //     title:'Pages',
  //     classsChange: 'mm-collapse',
  //     iconStyle: <i className="flaticon-landing-page"></i>,
  //     content : [
  //         {
  //             title:'Error',
  //             hasMenu : true,
  //             content : [
  //                 {
  //                     title: 'Error 400',
  //                     to : 'page-error-400',
  //                 },
  //                 {
  //                     title: 'Error 403',
  //                     to : 'page-error-403',
  //                 },
  //                 {
  //                     title: 'Error 404',
  //                     to : 'page-error-404',
  //                 },
  //                 {
  //                     title: 'Error 500',
  //                     to : 'page-error-500',
  //                 },
  //                 {
  //                     title: 'Error 503',
  //                     to : 'page-error-503',
  //                 },
  //             ],
  //         },
  //         {
  //             title:'Lock Screen',
  //             to: 'page-lock-screen',
  //         },

  //     ]
  // },
];
