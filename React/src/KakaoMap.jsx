import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const MapSection = styled.section`
  padding: 30px;
  background: white;
`;

const MapHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    color: #212529;
    font-size: 24px;
  }
`;

const MapControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #6c757d;
`;

const MapContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const MapLegend = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 150px;

  h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #212529;
  }
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
`;

const LegendColor = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => {
    const colors = {
      urgent: '#dc3545',
      high: '#fd7e14',
      medium: '#ffc107',
      low: '#28a745'
    };
    return colors[props.type] || '#6c757d';
  }};
`;

const MapStats = styled.div`
  display: flex;
  gap: 30px;
  justify-content: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const MapStat = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #495057;

  .stat-icon {
    font-size: 16px;
  }
`;

const KakaoMap = ({ inspections }) => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const KAKAO_API_KEY = import.meta.env.VITE_APP_KAKAO_API_KEY;

    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.async = true;
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&autoload=false`;
      document.head.appendChild(script);
      
      script.onload = () => {
        window.kakao.maps.load(() => {
          initMap();
          setMapLoaded(true);
        });
      };
    }
  }, []);

  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      addMarkers();
    }
  }, [inspections, mapLoaded]);

  // 우선순위에 따른 마커 이미지 생성
  const createMarkerImage = (priority) => {
    const colors = {
      urgent: '#dc3545',  
      high: '#fd7e14',    
      medium: '#ffc107',
      low: '#28a745' 
    };

    const color = colors[priority] || '#6c757d';
    
    // SVG 마커 생성
    const svgMarker = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
        <text x="16" y="20" text-anchor="middle" fill="${color}" font-size="12" font-weight="bold">!</text>
      </svg>
    `;

    // SVG를 base64로 인코딩
    const encodedSvg = btoa(unescape(encodeURIComponent(svgMarker)));
    const imageSrc = `data:image/svg+xml;base64,${encodedSvg}`;

    return new window.kakao.maps.MarkerImage(
      imageSrc,
      new window.kakao.maps.Size(32, 32),
      {
        offset: new window.kakao.maps.Point(16, 16)
      }
    );
  };

  const getPriorityText = (priority) => {
    const texts = {
      urgent: '긴급',
      high: '높음',
      medium: '보통',
      low: '낮음'
    };
    return texts[priority] || priority;
  };

  const initMap = () => {
    const container = document.getElementById('kakao-map');
    const options = {
      center: new window.kakao.maps.LatLng(35.8714, 128.6014),
      level: 6
    };

    mapRef.current = new window.kakao.maps.Map(container, options);
  };

  const addMarkers = () => {
    if (!mapRef.current) return;

    inspections.forEach((inspection) => {
      const markerPosition = new window.kakao.maps.LatLng(
        inspection.lat, 
        inspection.lng
      );

      // 우선순위에 따른 커스텀 마커 이미지 생성
      const markerImage = createMarkerImage(inspection.priority);

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        image: markerImage
      });

      marker.setMap(mapRef.current);

      const priorityColor = {
        urgent: '#dc3545',
        high: '#fd7e14', 
        medium: '#ffc107',
        low: '#28a745'
      }[inspection.priority] || '#6c757d';

      const infoContent = `
        <div style="padding:12px; min-width:180px; border-radius:8px;">
          <div style="font-weight:bold; margin-bottom:8px; color:${priorityColor};">
            ${inspection.location}
          </div>
          <div style="font-size:12px; color:#666; margin-bottom:4px;">
            📍 ${inspection.district}
          </div>
          <div style="font-size:12px; color:#666; margin-bottom:4px;">
            ⚠️ 위험도: ${inspection.riskScore}/100
          </div>
          <div style="font-size:12px; padding:4px 8px; background:${priorityColor}; color:white; border-radius:12px; display:inline-block;">
            ${getPriorityText(inspection.priority)}
          </div>
        </div>
      `;

      const infowindow = new window.kakao.maps.InfoWindow({
        content: infoContent
      });

      window.kakao.maps.event.addListener(marker, 'click', function() {
        infowindow.open(mapRef.current, marker);
      });
    });
  };

  const pendingCount = inspections.filter(i => i.status === 'pending').length;
  const completedCount = inspections.filter(i => i.status === 'completed').length;
  const scheduledCount = inspections.filter(i => i.status === 'scheduled').length;

  return (
    <MapSection>
      <MapHeader>
        <h2>사고 위험 지역 지도</h2>
        <MapControls>
          <span>📍 대구시 사고 위험 지역</span>
        </MapControls>
      </MapHeader>
      
      <MapContainer>
        <div id="kakao-map" style={{ width: '100%', height: '500px', borderRadius: '12px' }}></div>
        
        <MapLegend>
          <h4>위험도 범례</h4>
          <LegendItem>
            <LegendColor type="urgent" />
            <span>긴급 (70점 이상)</span>
          </LegendItem>
          <LegendItem>
            <LegendColor type="high" />
            <span>높음 (50-69점)</span>
          </LegendItem>
          <LegendItem>
            <LegendColor type="medium" />
            <span>보통 (30-49점)</span>
          </LegendItem>
          <LegendItem>
            <LegendColor type="low" />
            <span>낮음 (30점 미만)</span> 
          </LegendItem>
        </MapLegend>
      </MapContainer>

      <MapStats>
        <MapStat>
          <span className="stat-icon">📋</span>
          <span>점검 대기 ({pendingCount})</span>
        </MapStat>
        <MapStat>
          <span className="stat-icon">✅</span>
          <span>점검 완료 ({completedCount})</span>
        </MapStat>
        <MapStat>
          <span className="stat-icon">📅</span>
          <span>점검 일정 ({scheduledCount})</span>
        </MapStat>
      </MapStats>
    </MapSection>
  );
};

export default KakaoMap;