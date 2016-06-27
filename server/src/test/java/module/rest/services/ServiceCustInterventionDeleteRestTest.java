package module.rest.services;

import javax.ws.rs.core.Response;

import org.ap.web.entity.mongo.InterventionBean;
import org.ap.web.rest.servlet.services.ServicesServlet;
import org.junit.Test;

import junit.framework.TestCase;
import module.rest.RestTestBase;

public class ServiceCustInterventionDeleteRestTest extends RestTestBase {

	public ServiceCustInterventionDeleteRestTest() {
		super(ServicesServlet.PATH);
	}
	
	/* TEST DATA */
	
	private String getBaseUrl() {
		return "/" + service1.getId() + "/customers/" + customer1.getId() + "/interventions";
	}
	
	/* TEST CASES */
	
	/* Negative Testing */
		
	@Test
	public void testI_asUnknownUser() throws Exception {
		Response response = prepare(getBaseUrl(), "dummy", "dummy").put(write(intervention1));
		TestCase.assertEquals(401, response.getStatus());
		TestCase.assertFalse(response.hasEntity());
	}
	
	/* Positive Testing */
	
	@Test
	public void testV_asService() throws Exception {
		InterventionBean[] interventions = prepare(getBaseUrl(), service1.getUser()).get(InterventionBean[].class);
		int init = interventions.length;
		
		Response rsp = prepare(getBaseUrl() + "/" + intervention1.getId(), service1.getUser()).delete();
		TestCase.assertEquals(200, rsp.getStatus());
		TestCase.assertFalse(rsp.hasEntity());
		
		interventions  = prepare(getBaseUrl(), service1.getUser()).get(InterventionBean[].class);
		TestCase.assertEquals(init - 1, interventions.length);
	}
}
