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
        question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In urna turpis, varius vitae porta in, hendrerit eget felis.'
      },
      {
        id: 'acc-2',
        question: 'Lorem ipsum dolor sit amet?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In urna turpis, varius vitae porta in, hendrerit eget felis.'
      },
      {
        id: 'acc-3',
        question: 'Nam viverra ante in nunc eleifend,vitae faucibus libero iaculis.',
        answer: 'Vestibulum euismod, lacus non viverra feugiat, sem velit interdum tortor, luctus ultrices ante ante ut augue. Ut pretium ligula placerat erat luctus, at lacinia metus tincidunt.'
      },
      {
        id: 'acc-4',
        question: 'Curabitur eleifend ut nulla a volutpat. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos?',
        answer: 'Pellentesque urna tortor, auctor nec metus eu, dapibus eleifend augue. Morbi vitae felis eget augue mollis malesuada ac non ante. Maecenas dignissim massa ut ligula consectetur fermentum. Proin tempor nec elit at consequat. Donec vitae quam interdum, fermentum nulla et, rutrum ipsum. Mauris tempus sed mauris porta luctus. '
      }
    ]
  },
  {
    id: 'adding-orders',
    name: 'Adding Orders',
    faqs: [
      {
        id: 'add-1',
        question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In urna turpis, varius vitae porta in, hendrerit eget felis.'
      },
      {
        id: 'add-2',
        question: 'Curabitur eleifend ut nulla a volutpat. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos?',
        answer: 'Pellentesque urna tortor, auctor nec metus eu, dapibus eleifend augue. Morbi vitae felis eget augue mollis malesuada ac non ante. Maecenas dignissim massa ut ligula consectetur fermentum. Proin tempor nec elit at consequat. Donec vitae quam interdum, fermentum nulla et, rutrum ipsum. Mauris tempus sed mauris porta luctus. '
      },
      {
        id: 'add-3',
        question: 'Nam viverra ante in nunc eleifend,vitae faucibus libero iaculis.',
        answer: 'Vestibulum euismod, lacus non viverra feugiat, sem velit interdum tortor, luctus ultrices ante ante ut augue. Ut pretium ligula placerat erat luctus, at lacinia metus tincidunt.'
      }
    ]
  },
  {
    id: 'technical',
    name: 'Technical',
    faqs: [
      {
        id: 'tech-1',
        question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In urna turpis, varius vitae porta in, hendrerit eget felis.'
      },
      {
        id: 'tech-2',
        question: 'Lorem ipsum dolor sit amet?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In urna turpis, varius vitae porta in, hendrerit eget felis.'
      },
      {
        id: 'tech-3',
        question: 'Nam viverra ante in nunc eleifend,vitae faucibus libero iaculis.',
        answer: 'Vestibulum euismod, lacus non viverra feugiat, sem velit interdum tortor, luctus ultrices ante ante ut augue. Ut pretium ligula placerat erat luctus, at lacinia metus tincidunt.'
      }
    ]
  }
];