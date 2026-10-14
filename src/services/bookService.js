import api from './api';

// Curated fallback books in case third party API hits rate limits or is offline
export const FALLBACK_BOOKS = [
  {
    key: '/works/OL45804W',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author_name: ['Robert C. Martin'],
    first_publish_year: 2008,
    cover_i: 8231856,
    subject: ['Software Engineering', 'Programming', 'Computers'],
    publisher: ['Prentice Hall'],
    isbn: ['9780132350884'],
    ratings_average: 4.4,
    availability: 'Available',
    copies: 5,
    description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees.',
  },
  {
    key: '/works/OL82586W',
    title: 'The Great Gatsby',
    author_name: ['F. Scott Fitzgerald'],
    first_publish_year: 1925,
    cover_i: 7452478,
    subject: ['Classic Literature', 'Fiction', 'Jazz Age'],
    publisher: ['Charles Scribner’s Sons'],
    isbn: ['9780743273565'],
    ratings_average: 4.1,
    availability: 'Borrowed',
    copies: 0,
    description: 'The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
  },
  {
    key: '/works/OL27479W',
    title: 'To Kill a Mockingbird',
    author_name: ['Harper Lee'],
    first_publish_year: 1960,
    cover_i: 8225261,
    subject: ['Classics', 'Historical Fiction', 'Legal'],
    publisher: ['J. B. Lippincott & Co.'],
    isbn: ['9780061120084'],
    ratings_average: 4.8,
    availability: 'Available',
    copies: 3,
    description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.',
  },
  {
    key: '/works/OL1168007W',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author_name: ['Erich Gamma', 'Richard Helm', 'Ralph Johnson', 'John Vlissides'],
    first_publish_year: 1994,
    cover_i: 10452391,
    subject: ['Software Architecture', 'Object-Oriented Design', 'Computer Science'],
    publisher: ['Addison-Wesley Professional'],
    isbn: ['9780201633610'],
    ratings_average: 4.5,
    availability: 'Available',
    copies: 4,
    description: 'Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple and succinct solutions.',
  },
  {
    key: '/works/OL262758W',
    title: 'Pride and Prejudice',
    author_name: ['Jane Austen'],
    first_publish_year: 1813,
    cover_i: 12695537,
    subject: ['Romance', 'Classic Literature', 'Regency'],
    publisher: ['T. Egerton'],
    isbn: ['9780141439518'],
    ratings_average: 4.6,
    availability: 'Available',
    copies: 6,
    description: 'Since its immediate success in 1813, Pride and Prejudice has remained one of the most popular novels in the English language.',
  },
  {
    key: '/works/OL338784W',
    title: 'A Brief History of Time',
    author_name: ['Stephen Hawking'],
    first_publish_year: 1988,
    cover_i: 10224163,
    subject: ['Cosmology', 'Physics', 'Science'],
    publisher: ['Bantam Books'],
    isbn: ['9780553380163'],
    ratings_average: 4.7,
    availability: 'Available',
    copies: 2,
    description: 'A landmark volume in science writing by one of the great minds of our time, exploring how the universe began and what makes its existence possible.',
  },
  {
    key: '/works/OL257943W',
    title: 'The Pragmatic Programmer',
    author_name: ['David Thomas', 'Andrew Hunt'],
    first_publish_year: 1999,
    cover_i: 8314120,
    subject: ['Programming', 'Best Practices', 'Software Engineering'],
    publisher: ['Addison-Wesley'],
    isbn: ['9780135957059'],
    ratings_average: 4.7,
    availability: 'Available',
    copies: 4,
    description: 'Straight from the programming trenches, The Pragmatic Programmer cuts through the increasing specialization and technicalities of modern development.',
  },
  {
    key: '/works/OL21635398W',
    title: 'Atomic Habits',
    author_name: ['James Clear'],
    first_publish_year: 2018,
    cover_i: 12843431,
    subject: ['Self-Help', 'Productivity', 'Psychology'],
    publisher: ['Avery'],
    isbn: ['9780735211292'],
    ratings_average: 4.9,
    availability: 'Available',
    copies: 7,
    description: 'An easy & proven way to build good habits and break bad ones.',
  },
];

export const bookService = {
  // Search books via OpenLibrary API
  searchBooks: async (query = 'programming', limit = 12) => {
    try {
      const response = await api.get('/search.json', {
        params: {
          q: query || 'library',
          limit: limit,
        },
      });

      if (response.data && response.data.docs && response.data.docs.length > 0) {
        return response.data.docs.map((doc, idx) => ({
          key: doc.key || `/works/sample-${idx}`,
          title: doc.title,
          author_name: doc.author_name || ['Unknown Author'],
          first_publish_year: doc.first_publish_year || 'N/A',
          cover_i: doc.cover_i,
          subject: (doc.subject || ['General']).slice(0, 3),
          publisher: (doc.publisher || ['Global Press']).slice(0, 1),
          isbn: doc.isbn || ['N/A'],
          ratings_average: doc.ratings_average ? Number(doc.ratings_average.toFixed(1)) : 4.2,
          availability: idx % 4 === 3 ? 'Borrowed' : 'Available',
          copies: idx % 4 === 3 ? 0 : (idx % 5) + 2,
          description: doc.first_sentence ? doc.first_sentence[0] : 'Explore this prominent title in our library collection with comprehensive bibliographic records.',
        }));
      }

      return FALLBACK_BOOKS.filter(b => 
        b.title.toLowerCase().includes(query.toLowerCase()) ||
        b.author_name.some(a => a.toLowerCase().includes(query.toLowerCase()))
      );
    } catch (err) {
      console.warn('Using fallback book collection due to API error/rate-limit:', err.message);
      return FALLBACK_BOOKS.filter(b => 
        !query || 
        b.title.toLowerCase().includes(query.toLowerCase()) ||
        b.author_name.some(a => a.toLowerCase().includes(query.toLowerCase())) ||
        b.subject.some(s => s.toLowerCase().includes(query.toLowerCase()))
      );
    }
  },

  getCoverUrl: (coverId, size = 'M') => {
    if (!coverId) return null;
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
  },
};
