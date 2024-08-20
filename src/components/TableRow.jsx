import React from "react";
import { Button, Popover, Table } from "@rewind-ui/core";

import linkImage from "../assets/small-link.png";

const TableRow = (props) => {
  const domains = {
    "Mugu Games": "mugugames",
    "Geek Fortress": "geekfortressgames",
  };

  return (
    <Table.Tr>
      <Table.Td>
        <Popover>
          <Popover.Trigger>
            <p>{props.name}</p> {/* Name */}
          </Popover.Trigger>
          <Popover.Content>
            <img style={{ height: "310px" }} src={props.image} />
          </Popover.Content>
        </Popover>
      </Table.Td>
      <Table.Td>{props.set}</Table.Td> {/* Set */}
      <Table.Td>{props.condition}</Table.Td> {/* Condition */}
      <Table.Td>{props.price}</Table.Td> {/* Price */}
      <Table.Td>{props.quantity}</Table.Td> {/* Quantity */}
      <Table.Td>{props.location}</Table.Td> {/* Location */}
      <Table.Td>
        <Button
          href={`https://${domains[props.location]}.com` + props.link}
          target="_blank"
          as="a"
          variant="link"
          size="xs"
          icon
        >
          <img src={linkImage} /> {/* Location */}
        </Button>
      </Table.Td>
    </Table.Tr>
  );
};

export default TableRow;
