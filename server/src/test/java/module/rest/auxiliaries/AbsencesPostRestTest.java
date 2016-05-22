package module.rest.auxiliaries;

import java.util.Date;

import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.ap.web.entity.mongo.AbsenceBean;
import org.ap.web.internal.APException;
import org.ap.web.rest.servlet.auxiliaries.AuxiliariesServlet;
import org.junit.Test;

import junit.framework.TestCase;
import module.rest.RestTestBase;
import tools.AssertHelper;

public class AbsencesPostRestTest extends RestTestBase {

	public String getUrl(String id) {
		return "/" + id + "/absences";
	}
	
	public AbsencesPostRestTest() {
		super(AuxiliariesServlet.PATH);
	}
	
	/* TEST CASES */
	
	/* Negative Testing */
	
	@Test
	public void testI_badHours() throws Exception {
		absenceAux11.setStartHour(absenceAux11.getEndHour() + 2);
		Response response = prepare(getUrl(auxiliary1.getId()), auxiliary1.getUser()).post(write(absenceAux11));
		AssertHelper.assertException(APException.ABSENCE_HOURS_INVALID, response);
	}
	@Test
	public void testI_sameHours() throws Exception {
		absenceAux11.setStartHour(absenceAux11.getEndHour());
		Response response = prepare(getUrl(auxiliary1.getId()), auxiliary1.getUser()).post(write(absenceAux11));
		AssertHelper.assertException(APException.ABSENCE_HOURS_INVALID, response);
	}
	@Test
	public void testI_unauthorized() throws Exception {
		Response response = prepare(getUrl(auxiliary1.getId()), auxiliary1.getUser().getName(), "dummy").post(write(absenceAux11));
		TestCase.assertEquals(Status.UNAUTHORIZED.getStatusCode(), response.getStatus());
		TestCase.assertFalse(response.hasEntity());
	}
	@Test
	public void testI_asAdmin() throws Exception {
		Response response = prepare(getUrl(auxiliary1.getId()), accountAdmin.getUser()).post(write(absenceAux11));
		TestCase.assertEquals(Status.FORBIDDEN.getStatusCode(), response.getStatus());
		TestCase.assertFalse(response.hasEntity());
	}
	
	/* Positive Testing */
	
	@Test
	public void testV_response() throws Exception {
		AbsenceBean bean = new AbsenceBean();
		bean.setStartHour(0);
		bean.setEndHour(24);
		bean.setDate(new Date());
		Response response = prepare(getUrl(auxiliary1.getId()), auxiliary1.getUser()).post(write(bean));
		TestCase.assertEquals(Status.CREATED.getStatusCode(), response.getStatus());
		TestCase.assertTrue(response.hasEntity());
	}
	@Test
	public void testV_createOne() throws Exception {
		AbsenceBean[] beans1 = prepare(getUrl(auxiliary1.getId()), auxiliary1.getUser()).get(AbsenceBean[].class);
		
		AbsenceBean bean = prepare(getUrl(auxiliary1.getId()), auxiliary1.getUser()).post(write(absenceAux11), AbsenceBean.class);
		AssertHelper.assertAbsence(absenceAux11, bean);
		
		AbsenceBean[] beans2 = prepare(getUrl(auxiliary1.getId()), auxiliary1.getUser()).get(AbsenceBean[].class);
		TestCase.assertEquals(beans1.length + 1, beans2.length);
	}
	@Test
	public void testV_createSeverals() throws Exception {
		AbsenceBean[] beans1 = prepare(getUrl(auxiliary1.getId()), auxiliary1.getUser()).get(AbsenceBean[].class);
		
		Date today = new Date();
		AbsenceBean bean1 = new AbsenceBean();
		bean1.setStartHour(8);
		bean1.setEndHour(12);
		bean1.setDate(today);		
		AbsenceBean bean2 = new AbsenceBean();
		bean2.setStartHour(13);
		bean2.setEndHour(14);
		bean2.setDate(today);
		prepare(getUrl(auxiliary1.getId()), auxiliary1.getUser()).post(write(bean1));
		prepare(getUrl(auxiliary1.getId()), auxiliary1.getUser()).post(write(bean2));
		
		AbsenceBean[] beans2 = prepare(getUrl(auxiliary1.getId()), auxiliary1.getUser()).get(AbsenceBean[].class);
		TestCase.assertEquals(beans1.length + 2, beans2.length);
	}
}
