import { useEffect, useState } from 'react'
import './App.css'
import { Accordion, InputGroup, Table, Text } from '@rewind-ui/core';
import axios from 'axios';

import TableRow from './components/TableRow';
import magnifyingGlass from './assets/magnifying-glass.png'

const App = () => {
  const [tableData, setTableData] = useState([])

  async function getData() {
    try {
      let result = await axios({
        url: 'http://localhost:8000/mugu',
        params: {
        query: "teferi"
        }
       })
  
       setTableData(result.data)
    }
    catch (err) {
       console.error(err);
    }
  }

  useEffect(() => {
    getData()
  }, [])

  return (
    <div style={{marginLeft: "12px"}}>
      <Text variant="d3">MTG Window Shopper</Text>
      <div>
        Use this application to search for cards from multiple storefronts at once.
      </div>
      <div style={{ width: "1186px", marginTop: "12px",  display: "flex", flexDirection: "row", alignItems: "center"}} >
        <InputGroup style={{ width:"100%", marginRight: "12px"}} >
          <InputGroup.Text>Search:</InputGroup.Text>
          <InputGroup.Input color="blue" placeholder="Search for cards...">
          </InputGroup.Input>
          <InputGroup.Button color="blue">
            <img src={magnifyingGlass} />
          </InputGroup.Button>
        </InputGroup>
        <InputGroup style={{ minWidth: "220px" }}>
          <InputGroup.Text style={{ minWidth: "80px"}}>
            Sort by:
          </InputGroup.Text>
          <InputGroup.Select>
            <option>Name</option>
            <option>Set</option>
            <option>Condition</option>
            <option>Price</option>
            <option>Quantity</option>
            <option>Location</option>
          </InputGroup.Select>
        </InputGroup>
      </div>
      <div style={{ width: "1186px", marginTop: "12px", display: "flex", flexDirection: "row", alignItems: "flex-start"}} >
        <Accordion style={{ width:"100%", marginRight: "12px"}} defaultItem="item-1">
          <Accordion.Item anchor="item-1">
            <Accordion.Header style={{ height: "40px"}}>Advanced options</Accordion.Header>
            <Accordion.Body>
              Filter by:
              <div style={{ marginLeft: "12px"}}>
                <InputGroup style={{ maxWidth: "580px", marginTop: "12px", marginRight: "12px"}} >
                  <InputGroup.Text style={{ minWidth: "80px"}}>
                    Stores:
                  </InputGroup.Text>
                  <InputGroup.Combobox placeholder="Select stores..." multiple={true}>
                    <InputGroup.Combobox.Option value="1" label="Mugu Games" />
                    <InputGroup.Combobox.Option value="2" label="Geek Fortress" />
                    <InputGroup.Combobox.Option value="3" label="Stupid Geeks" />
                    <InputGroup.Combobox.Option value="4" label="Zulu's" />
                  </InputGroup.Combobox>
                </InputGroup>
                <InputGroup style={{ maxWidth: "580px", marginTop: "12px", marginRight: "12px"}} >
                  <InputGroup.Text style={{ minWidth: "80px"}}>
                    Price:
                  </InputGroup.Text>
                  {/* TODO: key press handler to put $ in front of user's input */}
                  <InputGroup.Input placeholder="Min price..." />
                  <InputGroup.Text>
                    To:
                  </InputGroup.Text>
                  {/* TODO: key press handler to put $ in front of user's input */}
                  <InputGroup.Input placeholder="Max price..." />
                </InputGroup>
              </div>
              <InputGroup style={{ marginTop: "12px", minWidth:"250px", maxWidth: "255px"}}>
                <InputGroup.Text style={{ minWidth: "180px"}}>
                  Max results per store:
                </InputGroup.Text>
                <InputGroup.Select>
                  <option>5</option>
                  <option>10</option>
                  <option>25</option>
                </InputGroup.Select>
              </InputGroup>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        <InputGroup style={{ marginLeft: "auto", minWidth: "220px" }}>
          <InputGroup.Text style={{ minWidth: "80px"}}>
            Order:
          </InputGroup.Text>
          <InputGroup.Select>
            <option>Ascending</option>
            <option>Descending</option>
          </InputGroup.Select>
        </InputGroup>
      </div>
      <div style={{ padding: "12px", maxWidth: "1200px"}}>
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
              <TableRow key={row.id} name={row.name} set={row.set} condition={row.condition} price={row.price} quantity={row.quantity} location={row.location} link={row.link}></TableRow>
              )
            )}
          </Table.Tbody>
        </Table>
      </div>

    </div>
  )
}

export default App
