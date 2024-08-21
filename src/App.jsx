import { useCallback, useRef, useState } from "react";
import "./App.css";
import { Accordion, Checkbox, InputGroup, Table, Text } from "@rewind-ui/core";
import axios from "axios";
import debounce from "lodash.debounce";

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
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedStores, setSelectedStores] = useState([]);
  const [maxResultsPerStore, setMaxResultsPerStore] = useState(25);
  const [fetchingData, setFetchingData] = useState(false);

  const inputRef = useRef(null);

  const sortData = (sort, data, order) => {
    let newTableData = [...data];
    if (sort === "relevance") {
      newTableData = sortByRelevance(newTableData, currentQuery, order);
    } else {
      newTableData = sortByField(newTableData, sort, order);
    }

    return newTableData;
  };

  function getMuguData(query) {
    return axios({
      url: "http://localhost:8000/mugu",
      params: {
        searchQuery: query,
        showOOS: showOOS,
        minPrice: minPrice,
        maxPrice: maxPrice,
      },
    });
  }

  function getGFData(query) {
    return axios({
      url: "http://localhost:8000/gf",
      params: {
        searchQuery: query,
        showOOS: showOOS,
        minPrice: minPrice,
        maxPrice: maxPrice,
      },
    });
  }

  function getZulusData(query) {
    return axios({
      url: "http://localhost:8000/zulus",
      params: {
        searchQuery: query,
        showOOS: showOOS,
      },
    });
  }

  function getStoreData(store, query) {
    return axios({
      url: `http://localhost:8000/${store}`,
      params: {
        searchQuery: query,
        showOOS: showOOS,
        minPrice: minPrice,
        maxPrice: maxPrice,
      },
    });
  }

  async function getData(query) {
    try {
      setFetchingData(true);
      let noSelectedStores = false;
      if (selectedStores.length === 0) {
        noSelectedStores = true;
      }

      let promises = [];

      if (selectedStores.includes("mugugames") || noSelectedStores) {
        promises.push(getStoreData("mugu", query));
      }

      if (selectedStores.includes("geekfortressgames") || noSelectedStores) {
        promises.push(getStoreData("gf", query));
      }

      if (selectedStores.includes("zulusgames") || noSelectedStores) {
        promises.push(getStoreData("zulus", query));
      }

      let data = [];

      await Promise.all(promises).then((resolvedPromises) => {
        for (let i = 0; i < resolvedPromises.length; i++) {
          const result = resolvedPromises[i];

          if (result.data?.length > 0) {
            data = data.concat(result.data.slice(0, maxResultsPerStore));
          }
        }
      });

      const sortedData = sortData(sortBy, data, isOrderAscending);

      setTableData(structuredClone(sortedData));
      setServerData(structuredClone(sortedData));
      setCurrentQuery(query);
      setFetchingData(false);
    } catch (err) {
      console.error(err);
      setFetchingData(false);
    }
  }

  const handleSearchChange = (event) => {
    setSearchBarContent(event.target.value);
  };

  const handleSearch = () => {
    getData(searchBarContent);
  };

  const debouncedHandleSearch = debounce(handleSearch, 300);

  const handleSortByChange = (event) => {
    const newSortBy = event.target.value.toLowerCase();
    const data = sortData(newSortBy, serverData, isOrderAscending);

    setTableData(data);
    setSortBy(newSortBy);
  };

  const handleOrderChange = (event) => {
    const newOrderBy = event.target.value.toLowerCase();
    const isNewOrderByAscending = newOrderBy.toLowerCase() === "ascending";

    const data = sortData(sortBy, serverData, isNewOrderByAscending);

    setTableData(data);
    setIsOrderAscending(event.target.value.toLowerCase() === "ascending");
  };

  const handleShowOOSChange = (event) => {
    setShowOOS(!showOOS);
  };

  const handlePriceRangeChange = (event, setState) => {
    // Get the raw input value
    const inputValue = event.target.value;

    // Remove any characters that are not digits or dots
    const filteredValue = inputValue.replace(/[^0-9.]/g, "");

    // Set the filtered value to state
    setState(filteredValue);
  };

  const createHandlePriceRangeChange = (setState) => (event) => {
    handlePriceRangeChange(event, setState);
  };

  const handlePriceRangeBlur = (event, state, setState) => {
    const regex = /^\$/; // Regular expression to match the leading dollar sign
    const value = event.target.value.replace(regex, "");
    const parts = value.split(".");

    if (parts.length === 1) {
      if (parts[0] !== "") {
        setState(state + ".00");
      }
    } else if (parts.length > 1) {
      if (parts[0] === "") {
        parts[0] = "0";
      }

      let newMinPrice = parts[0] + ".";

      if (parts[1].length === 0) {
        newMinPrice = newMinPrice + "00";
      } else if (parts[1].length === 1) {
        newMinPrice = newMinPrice + parts[1] + "0";
      } else if (parts[1].length > 2) {
        newMinPrice = newMinPrice + parts[1][0] + parts[1][1];
      } else {
        newMinPrice = newMinPrice + parts[1];
      }

      setState(newMinPrice);
    }
  };

  const createHandlePriceRangeBlur = (state, setState) => (event) => {
    handlePriceRangeBlur(event, state, setState);
  };

  const handleStoresChange = (event) => {
    setSelectedStores(event || []);
  };

  const handleMaxResultsPerStoreChange = (event) => {
    setMaxResultsPerStore(parseInt(event.target.value));
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  return (
    <div style={{ marginLeft: "12px" }}>
      <Text variant="d3">MTG Window Shopper</Text>
      <div>
        Use this application to search for cards from multiple storefronts in
        the greater Everett area at once.
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
            onChange={handleSearchChange}
            color="blue"
            ref={inputRef}
            onKeyUp={handleKeyPress}
            disabled={fetchingData}
            placeholder="Search for cards..."
          ></InputGroup.Input>
          <InputGroup.Button onClick={debouncedHandleSearch}>
            <img src={magnifyingGlass} />
          </InputGroup.Button>
        </InputGroup>
        <InputGroup style={{ minWidth: "220px" }}>
          <InputGroup.Text style={{ minWidth: "80px" }}>
            Sort by:
          </InputGroup.Text>
          <InputGroup.Select onChange={handleSortByChange}>
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
          <Accordion.Item>
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
                    onChange={handleStoresChange}
                  >
                    <InputGroup.Combobox.Option
                      value="mugugames"
                      label="Mugu Games"
                    />
                    <InputGroup.Combobox.Option
                      value="geekfortressgames"
                      label="Geek Fortress"
                    />
                    <InputGroup.Combobox.Option
                      value="stupidgeeksinc"
                      label="Stupid Geeks"
                    />
                    <InputGroup.Combobox.Option
                      value="zulusgames"
                      label="Zulu's"
                    />
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
                  <InputGroup.Input
                    placeholder="Min price..."
                    value={minPrice ? `$${minPrice}` : ""}
                    onChange={createHandlePriceRangeChange(setMinPrice)}
                    onBlur={createHandlePriceRangeBlur(minPrice, setMinPrice)}
                  />
                  <InputGroup.Text>To:</InputGroup.Text>
                  <InputGroup.Input
                    placeholder="Max price..."
                    value={maxPrice ? `$${maxPrice}` : ""}
                    onChange={createHandlePriceRangeChange(setMaxPrice)}
                    onBlur={createHandlePriceRangeBlur(maxPrice, setMaxPrice)}
                  />
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
                <InputGroup.Select
                  value={maxResultsPerStore}
                  onChange={handleMaxResultsPerStoreChange}
                >
                  <option>5</option>
                  <option>10</option>
                  <option>25</option>
                </InputGroup.Select>
              </InputGroup>
              <Checkbox
                checked={showOOS}
                onChange={handleShowOOSChange}
                label="Show out of stock"
              ></Checkbox>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        <InputGroup style={{ marginLeft: "auto", minWidth: "220px" }}>
          <InputGroup.Text style={{ minWidth: "80px" }}>Order:</InputGroup.Text>
          <InputGroup.Select onChange={handleOrderChange}>
            <option>Ascending</option>
            <option>Descending</option>
          </InputGroup.Select>
        </InputGroup>
      </div>
      <div style={{ padding: "12px", maxWidth: "1200px" }}>
        <div style={{ marginBottom: "12px", float: "right" }}>
          {fetchingData ? (
            <p>Please wait...</p>
          ) : currentQuery != "" ? (
            <p>
              Showing {tableData.length} results for: "{currentQuery}"
            </p>
          ) : null}
        </div>

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
                key={row.id + "-" + row.condition}
                name={row.name}
                set={row.set}
                condition={row.condition}
                price={row.price}
                quantity={row.quantity}
                location={row.location}
                link={row.link}
                image={row.image}
              ></TableRow>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    </div>
  );
};

export default App;
