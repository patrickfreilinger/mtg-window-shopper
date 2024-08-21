import React from "react";
import { Button, Popover, Table } from "@rewind-ui/core";

import linkImage from "../assets/small-link.png";

const TableRow = (props) => {
  return (
    <Table.Tr>
      <Table.Td>
        <Popover>
          <Popover.Trigger>
            <p>{props.name}</p>
          </Popover.Trigger>
          <Popover.Content>
            <img style={{ height: "310px" }} src={props.image} />
          </Popover.Content>
        </Popover>
      </Table.Td>
      <Table.Td>{props.set}</Table.Td>
      <Table.Td>{props.condition}</Table.Td>
      <Table.Td>{props.price}</Table.Td>
      <Table.Td>{props.quantity}</Table.Td>
      <Table.Td>{props.location}</Table.Td>
      <Table.Td>
        <Button
          href={props.link}
          target="_blank"
          as="a"
          variant="link"
          size="xs"
          icon
        >
          <img src={linkImage} />
        </Button>
      </Table.Td>
    </Table.Tr>
  );
};

export default TableRow;
