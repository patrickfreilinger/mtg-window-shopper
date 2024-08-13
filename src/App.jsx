import { useEffect, useState } from 'react'
import './App.css'
import { Button, Input, Table, Text } from '@rewind-ui/core';
import axios from 'axios';

import TableRow from './components/TableRow';

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

  console.log(tableData)

  return (
    <>
      <Text variant="d3">MTG Window Shopper</Text>
      <div>
        Use this application to search for cards from multiple storefronts at once.
      </div>

      <span style={{ marginLeft: "12px"}}>
        <Input style={{ maxWidth:"890px", marginRight: "12px"}} size="md" color="blue" placeholder="Search for cards"/>
        <Button color="green">
          Search
        </Button>
      </span>
      <div style={{ padding: "12px", maxWidth: "1000px"}}>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th align="left">Name</Table.Th>
            <Table.Th align="left">Set</Table.Th>
            <Table.Th align="left">Condition</Table.Th>
            <Table.Th align="left">Price</Table.Th>
            <Table.Th align="left">Quantity</Table.Th>
            <Table.Th align="left">Link</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {tableData.map((row) => (
            <TableRow name={row.name} set={row.set} condition={row.condition} price={row.price} quantity={row.quantity} link={row.link}></TableRow>
            )
          )}
        </Table.Tbody>
      </Table>
      </div>

    </>
  )
}

export default App
