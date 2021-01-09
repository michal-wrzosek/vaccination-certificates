import React from "react";
import blockies from "ethereum-blockies";
import styled from "styled-components";

import { useAccount } from "../../web3";

const SIZE_PX = 104;

const Hash = styled.pre`
  display: flex;
  margin-top: 4px;
  flex-direction: column;
  font-size: 12px;
  width: 101px;
  white-space: pre-wrap;
  word-break: break-all;
  color: #ba1414;
`;
const Avatar = styled.img`
  border-radius: 8px;
`;
const Container = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  width: ${SIZE_PX}px;
`;

export const UserInfo: React.FC = () => {
  const account = useAccount();
  const [avatar, setAvatar] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (!account) return;

    let canvasEl = blockies.create({
      seed: account,
      color: "#ba1414",
      bgcolor: "#1ea3c4",
      size: 8,
      scale: SIZE_PX / 8,
      spotcolor: "#26b4d4",
    }) as HTMLCanvasElement;

    const dataURL = canvasEl.toDataURL();

    console.log(account, dataURL);

    setAvatar(dataURL);
  }, [account]);

  if (!account || !avatar) return null;

  return (
    <Container>
      <Avatar src={avatar} width={SIZE_PX} height={SIZE_PX} />
      <Hash>{account}</Hash>
    </Container>
  );
};
