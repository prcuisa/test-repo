import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import ListNFTS from './ListNFTS';
import { getInitialNft } from '../../store/nftSlice';
import { getInitialCounts } from '../../store/dashboardSlice';
import { useSelector } from 'react-redux';
import { PageHeader } from '../../components/PageHeader';
import { useLocation, useNavigate } from 'react-router-dom';

const NFTPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { state, pathname } = useLocation();
  const [currentTab, setCurrentTab] = useState('draft');
  const nftCounts = useSelector((state) => state.nft.totalCount);
  const nfts = useSelector((state) => state.nft.nfts);

  useEffect(() => {
    if (state && state.currentTab) {
      setCurrentTab(state?.currentTab);
      navigate(pathname, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, currentTab]);
  
  useEffect(() => {
    dispatch(getInitialNft({})).then(() => {
      dispatch(getInitialCounts({}));
    });
  }, [dispatch]);
  
  // Refresh counts whenever NFTs array changes
  useEffect(() => {
    dispatch(getInitialCounts({}));
  }, [nfts.length, dispatch]);

  const tabs = {
    draft: {
      name: 'Draft NFTS',
      count: nftCounts || 0
    },
    live: {
      name: 'Live NFTS',
      count: nftCounts?.live || 0
    },
    burned: {
      name: 'Burned NFTS',
      count: nftCounts?.burned || 0
    }
  };



  return (
    <main className="main">
      <PageHeader
        tabs={tabs}
        setCurrentTab={setCurrentTab}
        currentTab={currentTab}
        title="NFT IN THE MAKING"
        description="Re-invent your relationship with your customers, fans, leads...<br />Go beyond and have unforgettable experiences tied to your NFT and your target group."
      />

      <ListNFTS setCurrentTab={setCurrentTab} currentTab={currentTab} />
    </main>
  );
};

export default NFTPage;
