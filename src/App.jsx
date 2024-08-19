import { useState } from "react";
import "./App.css";
import { Accordion, Checkbox, InputGroup, Table, Text } from "@rewind-ui/core";
import axios from "axios";

import TableRow from "./components/TableRow";
import magnifyingGlass from "./assets/magnifying-glass.png";

// Function to calculate relevance score of a string based on the query
function relevanceScore(row, query) {
  const queryTerms = query.toLowerCase().split(" ");
  const rowName = row.name.toLowerCase();
  let score = 0;

  queryTerms.forEach((term) => {
    const termCount = (rowName.match(new RegExp(term, "g")) || []).length;
    score += termCount;
  });

  return score;
}

// Function to sort rows by their relevance to the query
function sortByRelevance(rows, query, isOrderAscending) {
  if (isOrderAscending) {
    return rows.sort(
      (a, b) => relevanceScore(b, query) - relevanceScore(a, query)
    );
  }

  return rows.sort(
    (a, b) => relevanceScore(a, query) - relevanceScore(b, query)
  );
}

function parsePrice(value) {
  if (value === "out of stock") {
    return 0;
  }

  const regex = /^\$/; // Regular expression to match the leading dollar sign
  return parseInt(value.replace(regex, ""), 10);
}

function parseQuantity(value) {
  if (value === "out of stock") {
    return 0;
  }

  return parseInt(value, 10);
}

function parseCondition(value) {
  console.log(value);
  const words = value.split(",");

  if (words.length > 1) {
    switch (words[0].toLowerCase()) {
      case "nm-mint":
        return 5;
      case "light play":
      case "slight play":
        return 4;
      case "moderate play":
        return 3;
      case "heavy play":
        return 2;
      case "damaged":
        return 1;
    }
  }

  return 0;
}

function sortByField(rows, field, isOrderAscending) {
  return rows.sort((a, b) => {
    let valueA = a[field].toLowerCase();
    let valueB = b[field].toLowerCase();

    if (field === "price") {
      valueA = parsePrice(valueA);
      valueB = parsePrice(valueB);
    } else if (field === "quantity") {
      valueA = parseQuantity(valueA);
      valueB = parseQuantity(valueB);
    } else if (field === "condition") {
      valueA = parseCondition(valueA);
      valueB = parseCondition(valueB);
    }

    // Ascending
    if (isOrderAscending) {
      if (valueA < valueB) {
        return -1;
      }
      if (valueA > valueB) {
        return 1;
      }

      return 0;
    }

    // Descending
    if (valueA > valueB) {
      return -1;
    }
    if (valueA < valueB) {
      return 1;
    }

    return 0;
  });
}

const App = () => {
  const [serverData, setServerData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [searchBarContent, setSearchBarContent] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [isOrderAscending, setIsOrderAscending] = useState(true);
  const [currentQuery, setCurrentQuery] = useState("");
  const [showOOS, setShowOOS] = useState(false);

  const sortData = (sort, data, order) => {
    let newTableData = [...data];
    if (sort === "relevance") {
      newTableData = sortByRelevance(newTableData, currentQuery, order);
    } else {
      newTableData = sortByField(newTableData, sort, order);
    }

    return newTableData;
  };

  async function getData(query) {
    try {
      let resultMugu = await axios({
        url: "http://localhost:8000/mugu",
        params: {
          searchQuery: query,
          showOOS: showOOS,
        },
      });

      let resultGF = await axios({
        url: "http://localhost:8000/gf",
        params: {
          searchQuery: query,
          showOOS: showOOS,
        },
      });

      const data = sortData(
        sortBy,
        resultMugu.data.concat(resultGF.data),
        isOrderAscending
      );

      setTableData(structuredClone(data));
      setServerData(structuredClone(data));
      setCurrentQuery(query);
    } catch (err) {
      console.error(err);
    }
  }

  const onSearchChange = (event) => {
    setSearchBarContent(event.target.value);
  };

  const handleSearch = () => {
    getData(searchBarContent);
  };

  const onSortByChange = (event) => {
    const newSortBy = event.target.value.toLowerCase();
    const data = sortData(newSortBy, serverData, isOrderAscending);

    setTableData(data);
    setSortBy(newSortBy);
  };

  const onOrderChange = (event) => {
    const newOrderBy = event.target.value.toLowerCase();
    const isNewOrderByAscending = newOrderBy.toLowerCase() === "ascending";

    const data = sortData(sortBy, serverData, isNewOrderByAscending);

    setTableData(data);
    setIsOrderAscending(event.target.value.toLowerCase() === "ascending");
  };

  const onShowOOSChange = (event) => {
    setShowOOS(!showOOS);
  };

  return (
    <div style={{ marginLeft: "12px" }}>
      <Text variant="d3">MTG Window Shopper</Text>
      <div>
        Use this application to search for cards from multiple storefronts at
        once.
      </div>
      <div
        style={{
          width: "1186px",
          marginTop: "12px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <InputGroup style={{ width: "100%", marginRight: "12px" }}>
          <InputGroup.Text>Search:</InputGroup.Text>
          <InputGroup.Input
            onChange={onSearchChange}
            color="blue"
            placeholder="Search for cards..."
          ></InputGroup.Input>
          <InputGroup.Button onClick={handleSearch} color="blue">
            <img src={magnifyingGlass} />
          </InputGroup.Button>
        </InputGroup>
        <InputGroup style={{ minWidth: "220px" }}>
          <InputGroup.Text style={{ minWidth: "80px" }}>
            Sort by:
          </InputGroup.Text>
          <InputGroup.Select onChange={onSortByChange}>
            <option>Relevance</option>
            <option>Name</option>
            <option>Set</option>
            <option>Condition</option>
            <option>Price</option>
            <option>Quantity</option>
            <option>Location</option>
          </InputGroup.Select>
        </InputGroup>
      </div>
      <div
        style={{
          width: "1186px",
          marginTop: "12px",
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
        }}
      >
        <Accordion
          style={{ width: "100%", marginRight: "12px" }}
          defaultItem="item-1"
        >
          <Accordion.Item anchor="item-1">
            <Accordion.Header style={{ height: "40px" }}>
              Advanced options
            </Accordion.Header>
            <Accordion.Body>
              Filter by:
              <div style={{ marginLeft: "12px" }}>
                <InputGroup
                  style={{
                    maxWidth: "580px",
                    marginTop: "12px",
                    marginRight: "12px",
                  }}
                >
                  <InputGroup.Text style={{ minWidth: "80px" }}>
                    Stores:
                  </InputGroup.Text>
                  <InputGroup.Combobox
                    placeholder="Select stores..."
                    multiple={true}
                  >
                    <InputGroup.Combobox.Option value="1" label="Mugu Games" />
                    <InputGroup.Combobox.Option
                      value="2"
                      label="Geek Fortress"
                    />
                    <InputGroup.Combobox.Option
                      value="3"
                      label="Stupid Geeks"
                    />
                    <InputGroup.Combobox.Option value="4" label="Zulu's" />
                  </InputGroup.Combobox>
                </InputGroup>
                <InputGroup
                  style={{
                    maxWidth: "580px",
                    marginTop: "12px",
                    marginRight: "12px",
                  }}
                >
                  <InputGroup.Text style={{ minWidth: "80px" }}>
                    Price:
                  </InputGroup.Text>
                  {/* TODO: key press handler to put $ in front of user's input */}
                  <InputGroup.Input placeholder="Min price..." />
                  <InputGroup.Text>To:</InputGroup.Text>
                  {/* TODO: key press handler to put $ in front of user's input */}
                  <InputGroup.Input placeholder="Max price..." />
                </InputGroup>
              </div>
              <InputGroup
                style={{
                  marginTop: "12px",
                  marginBottom: "12px",
                  maxWidth: "255px",
                }}
              >
                <InputGroup.Text style={{ minWidth: "180px" }}>
                  Max results per store:
                </InputGroup.Text>
                <InputGroup.Select>
                  <option>5</option>
                  <option>10</option>
                  <option>25</option>
                </InputGroup.Select>
              </InputGroup>
              <Checkbox
                checked={showOOS}
                onChange={onShowOOSChange}
                label="Show out of stock"
              ></Checkbox>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        <InputGroup style={{ marginLeft: "auto", minWidth: "220px" }}>
          <InputGroup.Text style={{ minWidth: "80px" }}>Order:</InputGroup.Text>
          <InputGroup.Select onChange={onOrderChange}>
            <option>Ascending</option>
            <option>Descending</option>
          </InputGroup.Select>
        </InputGroup>
      </div>
      <div style={{ padding: "12px", maxWidth: "1200px" }}>
        {currentQuery != "" ? (
          <div style={{ marginBottom: "12px", float: "right" }}>
            Showing results for: "{currentQuery}"
          </div>
        ) : null}
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th align="left">Name</Table.Th>
              <Table.Th align="left">Set</Table.Th>
              <Table.Th align="left">Condition</Table.Th>
              <Table.Th align="left">Price</Table.Th>
              <Table.Th align="left">Quantity</Table.Th>
              <Table.Th align="left">Location</Table.Th>
              <Table.Th align="left">Link</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tableData.map((row) => (
              <TableRow
                key={row.id}
                name={row.name}
                set={row.set}
                condition={row.condition}
                price={row.price}
                quantity={row.quantity}
                location={row.location}
                link={row.link}
              ></TableRow>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    </div>
  );
};

export default App;
