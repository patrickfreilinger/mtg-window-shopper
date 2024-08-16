import React from 'react'
import { Button, Table } from '@rewind-ui/core';

import linkImage from '../assets/small-link.png'

const TableRow = (props) => {
    return (
      <Table.Tr>
        <Table.Td>{props.name}</Table.Td> {/* Name */}
        <Table.Td>{props.set}</Table.Td> {/* Set */}
        <Table.Td>{props.condition}</Table.Td> {/* Condition */}
        <Table.Td>{props.price}</Table.Td> {/* Price */}
        <Table.Td>{props.quantity}</Table.Td> {/* Quantity */}
        <Table.Td>{props.location}</Table.Td> {/* Location */}
        <Table.Td>
          <Button href={"https://mugugames.com" + props.link} target="_blank" as="a" variant="link" size="xs" icon >
            <img src={linkImage}/>
          </Button>
        </Table.Td> 
      </Table.Tr>
    )
}

export default TableRow