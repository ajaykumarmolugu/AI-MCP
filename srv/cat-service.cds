service CatalogService {
  entity Books {
    key ID: Integer;
    title: String;
    author: String;
  }

  action createBook(ID: Integer, title: String, author: String) returns Books;
  action updateBook(ID: Integer, title: String) returns Books;
  action deleteBook(ID: Integer) returns Boolean;
}
annotate CatalogService with @odata @mcp;