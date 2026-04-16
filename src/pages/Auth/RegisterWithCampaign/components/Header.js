import React from 'react';
import moment from 'moment';

import { useCurrentEthPrice } from '../../../../hooks/GetEthPrice';
import { ChainCryptoIcon } from '../../../../assets/icons';

export const Header = ({ campaign }) => {
  const currentETHPrice = useCurrentEthPrice()?.MATIC?.USD;

  const campaignEndsAt = moment(campaign?.ends_at);

  // Helper function to get image source safely
  const getImageSrc = (image) => {
    if (!image) {
      return ''; // Return empty string if image is null or undefined
    }
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    if (typeof image === 'string' && image.startsWith('data:')) {
      return image;
    }
    return `${process.env.REACT_APP_API}/uploads/${image}`;
  };

  return (
    <div className="header">
      <div className="banner_image">
        {campaign?.cover && <img src={getImageSrc(campaign.cover)} alt="Cover img" />}
      </div>

      <div className="logo">
        {campaign?.logo && <img src={getImageSrc(campaign.logo)} alt="Logo img" />}
      </div>

      <div className="campaign-title">
        <h2>{campaign.title}</h2>
      </div>

      <div className="campaign-info">
        <div className="campaign-info-item">
          <p className="title">Campaign end</p>

          {campaignEndsAt.format('MMMM')}
          <p className="value">
            <span>{campaignEndsAt.format('DD')}</span>
            <sup>TH {campaignEndsAt.format('YYYY')}</sup>
          </p>
        </div>
        <div className="campaign-info-item">
          <p className="title">Total supply</p>

          <p className="value">
            <span>{campaign?.nft?.copies}</span>
            <sup>NFTs</sup>
          </p>
        </div>
        <div className="campaign-info-item">
          <p className="title">Cost of NFT</p>

          <p className="value">
            {!campaign?.nft?.price || campaign?.nft?.price <= 0 ? (
              <span>FREE</span>
            ) : (
              <>
                <span>{campaign?.nft?.price}</span>
                <sup>&euro;</sup>
                {campaign?.nft?.price && (
                  <p className="crypto">
                    {(campaign?.nft?.price / currentETHPrice).toFixed(2)} <ChainCryptoIcon />
                  </p>
                )}
              </>
            )}
          </p>
        </div>
        <div className="campaign-info-item middle">
          <a
            href={`https://${campaign?.website}`}
            target="_blank"
            className="official-link"
            alt="Offical link"
            rel="noreferrer"
          >
            Official Link
          </a>
        </div>
      </div>
    </div>
  );
};
